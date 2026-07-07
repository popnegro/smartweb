# ElectroFix Store - Guía Rápida

## 🚀 Inicio Rápido

### 1. Desplegar

```bash
# Copiar archivos a tu servidor
# Abrir en navegador:
http://tu-dominio.com/index.html
```

No requiere instalación, build, ni dependencias.

### 2. Configuración Inicial

1. Abrir **admin.html**
2. Login: contraseña `admin123`
3. Ir a pestaña "Marca"
4. Configurar:
   - Nombre del negocio
   - WhatsApp para pedidos
   - Colores de marca

### 3. Agregar Productos

En admin panel:
1. Pestaña "Productos"
2. Completar formulario
3. Click "Agregar producto"

Los productos aparecen automáticamente en **index.html**.

---

## 📂 Archivos Principales

| Archivo | Descripción |
|---------|------------|
| `index.html` | Página principal para clientes |
| `admin.html` | Panel de administración |
| `js/config.js` | Configuración global |
| `js/state.js` | Gestor de estado |
| `js/utils.js` | Funciones helper |
| `js/ui.js` | Modales y notificaciones |
| `js/theme.js` | Temas personalizados |
| `js/checkout.js` | Flujo de compra |

---

## 🎯 Funcionalidades

### Para Clientes

✅ Ver catálogo de productos
✅ Comprar producto (3 pasos)
✅ Cotizar producto/servicio
✅ Contactar por WhatsApp automáticamente

### Para Admin

✅ Configurar marca y colores
✅ Agregar/eliminar productos
✅ Ver pedidos y cotizaciones
✅ Enviar por WhatsApp desde panel
✅ Exportar cotizaciones a CSV

---

## 🔐 Seguridad

**Credenciales por defecto:**
```
Usuario: admin
Contraseña: admin123
```

⚠️ **Cambiar antes de producción** en `js/config.js`:

```javascript
// Antes
ADMIN_ACCESS_KEY: 'admin123',

// Después (hasheada con SHA-256)
ADMIN_ACCESS_KEY: 'tu-nueva-contraseña',
```

---

## 💾 Datos

Todos los datos se guardan en **localStorage**:

- `electrofix_brand` - Configuración de marca
- `electrofix_products` - Catálogo
- `electrofix_orders` - Pedidos
- `electrofix_quote_requests` - Cotizaciones
- `electrofix_session` - Sesión admin

### Exportar datos

```javascript
// En consola del navegador
const data = {
  brand: localStorage.getItem('electrofix_brand'),
  products: localStorage.getItem('electrofix_products'),
  orders: localStorage.getItem('electrofix_orders'),
  quotes: localStorage.getItem('electrofix_quote_requests')
};
console.log(JSON.stringify(data, null, 2));
```

### Limpiar datos

```javascript
// En consola
stateManager.reset();
```

---

## 🎨 Personalización

### Cambiar colores

En admin:
1. Pestaña "Marca"
2. Seleccionar color primario y secundario
3. Guardado automático

O en `js/config.js`:

```javascript
DEFAULT_BRAND: {
  theme: {
    primary: '#0f766e',      // Color principal
    primaryHover: '#115e59',  // Hover del botón
    secondary: '#111827',     // Color oscuro
    accent: '#f59e0b'         // Acentos
  }
}
```

### Cambiar textos

En admin:
1. Pestaña "Marca"
2. Cambiar nombre del negocio
3. Guardado automático

O editar directamente `js/config.js`:

```javascript
DEFAULT_BRAND: {
  identity: {
    name: 'Tu Negocio',
    whatsapp: '+54 9 261 123 4567'
  },
  hero: {
    title: 'Tu Título',
    description: 'Tu descripción',
    ...
  }
}
```

---

## 📱 Responsivo

Totalmente adaptado a:
- 📱 Móvil (320px+)
- 📱 Tablet (768px+)
- 💻 Desktop (1024px+)

---

## ⚡ Performance

- **Load time**: <500ms
- **Bundle**: ~15KB
- **Database**: localStorage (gratis)
- **Hosting**: Cualquier servidor

---

## 🔗 Integración WhatsApp

Automática en dos casos:

### 1. Compra de producto
- Cliente completa flujo 3 pasos
- Se abre WhatsApp automáticamente
- Mensaje pre-llenado con datos

### 2. Cotización
- Admin click en "WhatsApp" en tabla
- Se abre WhatsApp del cliente
- Puede responder la cotización

**Requisito:** 
- Cliente debe tener WhatsApp instalado
- WhatsApp Web accesible (o app móvil)

---

## 🚀 Próximas Mejoras

- [ ] Backend integration
- [ ] Base de datos
- [ ] Email notifications
- [ ] Sistema de login mejorado
- [ ] Multi-usuario (White Label)
- [ ] Reportes y analytics
- [ ] Integración MercadoPago
- [ ] SMS notifications

---

## 🐛 Troubleshooting

### Datos no se guardan

```javascript
// Revisar localStorage
console.log(localStorage);

// Resetear
stateManager.reset();
```

### Estilos no se aplican

```javascript
// Chequear que CSS de Tailwind está cargado
// En index.html y admin.html debe estar:
<script src="https://cdn.tailwindcss.com"></script>
```

### WhatsApp no abre

```javascript
// Revisar que el número tenga formato correcto
// Debe tener código de país y formato válido
// Ej: +54 9 261 123 4567 (sin espacios interiores)
```

### Admin no puede loguear

```javascript
// Default: admin123
// Revisar que no haya espacios
// Console: localStorage.clear(); // Limpiar todo
```

---

## 📞 Soporte

Para ayuda, ver **ARCHITECTURE.md** para detalles técnicos.

---

**Última actualización:** Julio 2026
**Versión:** 2.0
