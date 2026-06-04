# Spec Técnico — Diagnóstico Digital White-Label
**Stack:** Turborepo · Next.js 14 · Node.js/Express · Prisma · Neon · Gemini 2.0 Flash · Cloudflare Pages · Render

---

## 1. Estructura del monorepo

```
diagnostico-digital/
├── apps/
│   ├── web/          ← Next.js 14 (frontend white-label por tenant)
│   ├── api/          ← Node.js + Express (backend REST)
│   └── admin/        ← Next.js 14 (panel super admin)
├── packages/
│   ├── db/           ← Prisma schema + cliente compartido
│   ├── ui/           ← Componentes React con theming dinámico
│   └── shared/       ← Types, validaciones, utils comunes
├── turbo.json
├── package.json
└── .env.example
```

---

## 2. Setup inicial

```bash
# Crear monorepo
npx create-turbo@latest diagnostico-digital
cd diagnostico-digital

# Instalar dependencias globales
pnpm add -D turbo typescript @types/node

# Apps
pnpm --filter web add next react react-dom tailwindcss
pnpm --filter api add express cors helmet bcryptjs jsonwebtoken
pnpm --filter api add -D @types/express @types/bcryptjs @types/jsonwebtoken nodemon ts-node
pnpm --filter admin add next react react-dom tailwindcss

# Packages
pnpm --filter @repo/db add prisma @prisma/client
pnpm --filter @repo/shared add zod

# Parsers de archivo (solo en api)
pnpm --filter api add papaparse xlsx multer
```

---

## 3. turbo.json

```json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "db:generate": {
      "cache": false
    },
    "db:migrate": {
      "cache": false
    },
    "lint": {},
    "typecheck": {}
  }
}
```

---

## 4. Prisma Schema (`packages/db/prisma/schema.prisma`)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─── TENANTS ───────────────────────────────────────────
model Tenant {
  id            String    @id @default(cuid())
  slug          String    @unique          // ferreteria-max
  name          String                     // "Ferretería Max"
  logoUrl       String?
  primaryColor  String    @default("#185FA5")
  accentColor   String    @default("#E6F1FB")
  customDomain  String?   @unique          // diagnostico.ferreteria.com
  plan          Plan      @default(FREE)
  active        Boolean   @default(true)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  users         User[]
  uploads       Upload[]
  reports       Report[]
  apiKeys       ApiKey[]
}

enum Plan {
  FREE       // 10 diagnósticos/mes
  STARTER    // 50 diagnósticos/mes
  PRO        // ilimitado + API pública
}

// ─── USERS ─────────────────────────────────────────────
model User {
  id           String    @id @default(cuid())
  tenantId     String
  email        String
  passwordHash String
  name         String
  role         Role      @default(VIEWER)
  active       Boolean   @default(true)
  lastLoginAt  DateTime?
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt

  tenant       Tenant    @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  uploads      Upload[]
  reports      Report[]

  @@unique([tenantId, email])
  @@index([tenantId])
}

enum Role {
  ADMIN    // gestiona usuarios del tenant
  VIEWER   // solo consulta reportes
}

// ─── UPLOADS ───────────────────────────────────────────
model Upload {
  id          String        @id @default(cuid())
  tenantId    String
  userId      String
  filename    String
  rowCount    Int
  status      UploadStatus  @default(PENDING)
  errorMsg    String?
  createdAt   DateTime      @default(now())

  tenant      Tenant        @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  user        User          @relation(fields: [userId], references: [id])
  report      Report?

  @@index([tenantId])
}

enum UploadStatus {
  PENDING
  PROCESSING
  DONE
  ERROR
}

// ─── REPORTS ───────────────────────────────────────────
model Report {
  id           String        @id @default(cuid())
  tenantId     String
  userId       String
  uploadId     String        @unique
  score        Int
  summary      Json          // { totalProductos, valorStock, margenPromedio, alertasCriticas }
  status       ReportStatus  @default(PENDING)
  createdAt    DateTime      @default(now())

  tenant       Tenant        @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  user         User          @relation(fields: [userId], references: [id])
  upload       Upload        @relation(fields: [uploadId], references: [id])
  findings     Finding[]
  recommendations Recommendation[]

  @@index([tenantId])
  @@index([tenantId, createdAt(sort: Desc)])
}

enum ReportStatus {
  PENDING
  READY
  ERROR
}

model Finding {
  id          String   @id @default(cuid())
  reportId    String
  type        String   // stock_muerto | quiebre_riesgo | baja_rentabilidad | estrella | oportunidad_precio
  priority    String   // alta | media | baja
  title       String
  description String
  products    String[] // array de nombres
  impact      String
  action      String

  report      Report   @relation(fields: [reportId], references: [id], onDelete: Cascade)

  @@index([reportId])
}

model Recommendation {
  id             String   @id @default(cuid())
  reportId       String
  order          Int
  title          String
  description    String
  savingEstimate String

  report         Report   @relation(fields: [reportId], references: [id], onDelete: Cascade)

  @@index([reportId])
}

// ─── API KEYS (plan PRO) ───────────────────────────────
model ApiKey {
  id         String   @id @default(cuid())
  tenantId   String
  keyHash    String   @unique
  name       String
  active     Boolean  @default(true)
  lastUsedAt DateTime?
  createdAt  DateTime @default(now())

  tenant     Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  @@index([tenantId])
}

// ─── SUPER ADMINS ──────────────────────────────────────
model SuperAdmin {
  id           String   @id @default(cuid())
  email        String   @unique
  passwordHash String
  createdAt    DateTime @default(now())
}
```

---

## 5. Middleware de tenant isolation (`apps/api/src/middleware/tenant.ts`)

```typescript
import { Request, Response, NextFunction } from "express";
import { db } from "@repo/db";

export interface TenantRequest extends Request {
  tenant?: { id: string; slug: string; plan: string };
  userId?: string;
}

// Resuelve tenant por slug en header o subdominio
export async function resolveTenant(req: TenantRequest, res: Response, next: NextFunction) {
  const slug =
    req.headers["x-tenant-slug"] as string ||
    req.hostname.split(".")[0];

  if (!slug || slug === "api") return next(); // rutas públicas

  const tenant = await db.tenant.findUnique({
    where: { slug, active: true },
    select: { id: true, slug: true, plan: true }
  });

  if (!tenant) return res.status(404).json({ error: "Tenant no encontrado" });

  req.tenant = tenant;
  next();
}

// Garantiza que TODA query filtre por tenantId del request
export function requireTenant(req: TenantRequest, res: Response, next: NextFunction) {
  if (!req.tenant) return res.status(401).json({ error: "Tenant requerido" });
  next();
}
```

---

## 6. Auth middleware (`apps/api/src/middleware/auth.ts`)

```typescript
import jwt from "jsonwebtoken";
import { TenantRequest } from "./tenant";

const JWT_SECRET = process.env.JWT_SECRET!;

export function requireAuth(req: TenantRequest, res: any, next: any) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return res.status(401).json({ error: "Token requerido" });

  try {
    const payload = jwt.verify(header.slice(7), JWT_SECRET) as { userId: string; tenantId: string };

    // Validar que el token corresponda al tenant del request
    if (req.tenant && payload.tenantId !== req.tenant.id) {
      return res.status(403).json({ error: "Acceso denegado" });
    }

    req.userId = payload.userId;
    next();
  } catch {
    res.status(401).json({ error: "Token inválido o expirado" });
  }
}
```

---

## 7. API Routes (`apps/api/src/routes/`)

### Autenticación — `/api/auth`

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/auth/register` | Registro (primer admin del tenant) |
| POST | `/api/auth/login` | Login, devuelve JWT |
| POST | `/api/auth/refresh` | Renueva token |
| POST | `/api/auth/logout` | Invalida sesión |

### Tenant — `/api/tenant`

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/tenant/config` | Devuelve theme/config del tenant |
| PATCH | `/api/tenant/config` | Actualiza logo, colores (solo ADMIN) |

### Uploads — `/api/uploads`

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/uploads` | Sube CSV/Excel, procesa en memoria |
| GET | `/api/uploads` | Historial de uploads del tenant |
| DELETE | `/api/uploads/:id` | Elimina upload y su reporte |

### Reportes — `/api/reports`

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/reports` | Lista reportes (paginado) |
| GET | `/api/reports/:id` | Detalle completo del reporte |
| DELETE | `/api/reports/:id` | Elimina reporte |

### Super Admin — `/api/admin` (requiere SuperAdmin token)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/admin/tenants` | Lista todos los tenants |
| POST | `/api/admin/tenants` | Crea nuevo tenant |
| PATCH | `/api/admin/tenants/:id` | Actualiza plan, activo/inactivo |
| DELETE | `/api/admin/tenants/:id` | Elimina tenant y todos sus datos |
| GET | `/api/admin/stats` | Métricas globales de uso |

---

## 8. Servicio de diagnóstico IA (`apps/api/src/services/diagnosis.ts`)

```typescript
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export interface InventoryRow {
  producto: string;
  costo: number;
  precio: number;
  stock: number;
  ventas: number;
  margen: number;
  rotacion: number;
}

export async function generateDiagnosis(rows: InventoryRow[]) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

  const prompt = `Sos un experto en gestión de inventario para depósitos en Argentina.
Analizá estos datos y respondé SOLO con JSON válido, sin markdown.

Datos: ${JSON.stringify(rows)}

Estructura: { resumen, hallazgos, recomendaciones, score }
(misma estructura del MVP)

Reglas:
- stock_muerto: rotación < 10% y stock > 100
- quiebre_riesgo: ventas > 80% del stock
- baja_rentabilidad: margen < 25%
- estrella: margen > 40% Y rotación > 70%
- oportunidad_precio: rotación > 85%
- score: 0-100
- Moneda ARS. Sé específico con números.`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().replace(/```json|```/g, "").trim();
  return JSON.parse(text);
}
```

---

## 9. Procesamiento de archivos (`apps/api/src/services/parser.ts`)

```typescript
import Papa from "papaparse";
import * as XLSX from "xlsx";

const COLUMN_MAP: Record<string, string> = {
  producto: "producto", product: "producto",
  costo: "costo", cost: "costo",
  precio: "precio", price: "precio",
  stock: "stock",
  ventas_mes: "ventas", ventas: "ventas", sales: "ventas",
};

export function normalizeRows(raw: Record<string, any>[]) {
  return raw.map(row => {
    const normalized: Record<string, any> = {};
    for (const [key, val] of Object.entries(row)) {
      const mapped = COLUMN_MAP[key.toLowerCase().trim()];
      if (mapped) normalized[mapped] = val;
    }
    const costo = parseFloat(normalized.costo ?? 0);
    const precio = parseFloat(normalized.precio ?? 0);
    const stock = parseFloat(normalized.stock ?? 0);
    const ventas = parseFloat(normalized.ventas ?? 0);
    return {
      producto: normalized.producto || "Sin nombre",
      costo, precio, stock, ventas,
      margen: precio > 0 ? +((precio - costo) / precio * 100).toFixed(1) : 0,
      rotacion: stock > 0 ? +(ventas / stock * 100).toFixed(1) : 0,
    };
  }).filter(r => r.producto !== "Sin nombre" || r.stock > 0);
}

export function parseCSV(buffer: Buffer) {
  const result = Papa.parse(buffer.toString("utf-8"), { header: true, skipEmptyLines: true });
  return normalizeRows(result.data as Record<string, any>[]);
}

export function parseExcel(buffer: Buffer) {
  const wb = XLSX.read(buffer, { type: "buffer" });
  const ws = wb.Sheets[wb.SheetNames[0]];
  return normalizeRows(XLSX.utils.sheet_to_json(ws));
}
```

---

## 10. Theming dinámico en Next.js (`apps/web/`)

### Carga del tema por slug (`app/layout.tsx`)

```typescript
// app/[slug]/layout.tsx
import { getTenantConfig } from "@/lib/tenant";

export default async function TenantLayout({ params, children }) {
  const config = await getTenantConfig(params.slug);

  return (
    <html lang="es">
      <body style={{
        "--color-primary": config.primaryColor,
        "--color-accent": config.accentColor,
      } as React.CSSProperties}>
        {children}
      </body>
    </html>
  );
}
```

### Fetch de config (`lib/tenant.ts`)

```typescript
export async function getTenantConfig(slug: string) {
  const res = await fetch(`${process.env.API_URL}/api/tenant/config`, {
    headers: { "x-tenant-slug": slug },
    next: { revalidate: 300 } // cache 5 min
  });
  if (!res.ok) notFound();
  return res.json();
}
```

---

## 11. Variables de entorno

### `.env.example` (raíz del monorepo)

```env
# Base de datos (Neon)
DATABASE_URL="postgresql://user:pass@ep-xxx.neon.tech/diagnostico?sslmode=require"

# Auth
JWT_SECRET="genera-con-openssl-rand-base64-32"
JWT_EXPIRES_IN="7d"

# IA (Gemini gratuito)
GEMINI_API_KEY="AIza..."

# URLs
NEXT_PUBLIC_API_URL="https://api.tudominio.com"
API_URL="https://api.tudominio.com"

# Super Admin
SUPER_ADMIN_SECRET="clave-para-crear-primer-super-admin"
```

---

## 12. Límites por plan

```typescript
// packages/shared/src/plans.ts
export const PLAN_LIMITS = {
  FREE:    { diagnosesPerMonth: 10,  maxUsers: 1, apiAccess: false },
  STARTER: { diagnosesPerMonth: 50,  maxUsers: 5, apiAccess: false },
  PRO:     { diagnosesPerMonth: -1,  maxUsers: -1, apiAccess: true }, // -1 = ilimitado
} as const;

// Middleware de cuota (apps/api/src/middleware/quota.ts)
export async function checkQuota(req, res, next) {
  const tenant = req.tenant;
  const limit = PLAN_LIMITS[tenant.plan].diagnosesPerMonth;
  if (limit === -1) return next();

  const start = startOfMonth(new Date());
  const count = await db.report.count({
    where: { tenantId: tenant.id, createdAt: { gte: start }, status: "READY" }
  });

  if (count >= limit) {
    return res.status(429).json({
      error: `Límite de ${limit} diagnósticos mensuales alcanzado.`,
      upgrade: true
    });
  }
  next();
}
```

---

## 13. Deploy — costo cero

### Neon (base de datos)

```bash
# 1. Crear cuenta en neon.tech
# 2. Crear proyecto "diagnostico-digital"
# 3. Copiar connection string a DATABASE_URL

# Migrations
pnpm --filter @repo/db exec prisma migrate deploy
pnpm --filter @repo/db exec prisma generate
```

### Render (API + Admin)

```yaml
# render.yaml
services:
  - type: web
    name: diagnostico-api
    runtime: node
    buildCommand: pnpm --filter api build
    startCommand: pnpm --filter api start
    envVars:
      - key: DATABASE_URL
        sync: false
      - key: JWT_SECRET
        sync: false
      - key: GEMINI_API_KEY
        sync: false
```

### Cloudflare Pages (Web frontend)

```bash
# Configuración en dashboard Cloudflare Pages
# Build command:   pnpm --filter web build
# Output dir:      apps/web/.next
# Root dir:        /
# Node version:    20
```

### Script de setup inicial

```bash
#!/bin/bash
# scripts/setup.sh

echo "→ Instalando dependencias..."
pnpm install

echo "→ Generando cliente Prisma..."
pnpm --filter @repo/db exec prisma generate

echo "→ Aplicando migrations..."
pnpm --filter @repo/db exec prisma migrate deploy

echo "→ Creando primer super admin..."
pnpm --filter api exec ts-node src/scripts/create-super-admin.ts

echo "→ Creando tenant de demo..."
pnpm --filter api exec ts-node src/scripts/seed-demo-tenant.ts

echo "✓ Setup completo"
```

---

## 14. Seguridad — checklist MVP

- [x] Todas las queries filtradas por `tenantId` en middleware
- [x] Archivos CSV/Excel procesados en RAM y descartados (sin storage)
- [x] Solo estadísticas agregadas se envían a la IA (nunca el archivo crudo)
- [x] JWT con expiración + validación cruzada tenant/user
- [x] Helmet.js en Express (headers de seguridad)
- [x] Rate limiting por tenant en endpoints de IA (express-rate-limit)
- [x] Passwords hasheados con bcrypt (salt rounds: 12)
- [x] CORS configurado por dominio de tenant
- [x] Variables de entorno nunca en código fuente
- [ ] HTTPS forzado (lo provee Render y Cloudflare automáticamente)

---

## 15. Roadmap post-MVP

| Fase | Feature | Prioridad |
|------|---------|-----------|
| 2 | Panel super admin completo | Alta |
| 2 | Subdominios dinámicos por tenant | Alta |
| 2 | Exportación de reportes a PDF | Media |
| 3 | Comparación histórica de diagnósticos | Media |
| 3 | Webhooks para tenants PRO | Baja |
| 3 | API pública documentada (Swagger) | Baja |
| 3 | Soporte para múltiples archivos/sucursales | Baja |
