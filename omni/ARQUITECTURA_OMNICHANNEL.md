# Plataforma de Mensajería Omnicanal Unificada Impulsada por IA

## 📋 Descripción Ejecutiva

Solución empresarial de mensajería omnicanal que centraliza comunicación desde WhatsApp, Instagram, Facebook y Web en un único dashboard escalable. Impulsada por IA con Claude API para respuestas inteligentes, análisis de sentimiento y automatización.

**Stack Tecnológico:**
- **Backend:** Node.js + Express + TypeScript
- **Frontend:** Next.js 14 + React + Tailwind CSS
- **Base de Datos:** PostgreSQL + Prisma ORM
- **Tiempo Real:** Socket.io + Bull Queues
- **IA:** Claude API (Anthropic)
- **Infraestructura:** Vercel + Railway + Docker

---

## 🏗️ Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                     Cliente (Next.js)                       │
│  ├─ Dashboard Omnicanal                                    │
│  ├─ Chat Unificado                                         │
│  ├─ Analítica y Reportes                                   │
│  └─ Panel de Control IA                                    │
└──────────────────┬──────────────────────────────────────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
   REST API           WebSocket
   (HTTP/2)           (Socket.io)
        │                     │
┌───────▼─────────────────────▼────────────────────────────────┐
│                    Backend (Node.js)                         │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  API Routes                                         │   │
│  │  ├─ /api/conversations                              │   │
│  │  ├─ /api/messages                                   │   │
│  │  ├─ /api/channels                                   │   │
│  │  ├─ /api/ai/suggestions                             │   │
│  │  └─ /api/webhooks/meta                              │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Servicios Principales                              │   │
│  │  ├─ ChannelService (Multi-canal)                    │   │
│  │  ├─ MessageService (Procesamiento)                  │   │
│  │  ├─ AIService (Respuestas Inteligentes)             │   │
│  │  ├─ WebhookService (Webhooks Meta)                  │   │
│  │  └─ AnalyticsService (Métricas)                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Colas y Procesamiento                              │   │
│  │  ├─ Message Queue (Bull)                            │   │
│  │  ├─ AI Processing Queue                             │   │
│  │  └─ Webhook Retry Queue                             │   │
│  └─────────────────────────────────────────────────────┘   │
└───────┬─────────────┬─────────────┬──────────────┬──────────┘
        │             │             │              │
        │             │             │              │
    ┌───▼─┐      ┌───▼──┐    ┌────▼─┐      ┌────▼──┐
    │  DB │      │Redis │    │Claude│      │ Meta  │
    │ PSQL│      │      │    │ API  │      │ BizAP │
    └─────┘      └──────┘    └──────┘      └───────┘
```

---

## 📂 Estructura de Carpetas (Turborepo)

```
omnichannel-platform/
├── apps/
│   ├── api/                          # Backend Node.js
│   │   ├── src/
│   │   │   ├── routes/
│   │   │   │   ├── conversations.ts
│   │   │   │   ├── messages.ts
│   │   │   │   ├── channels.ts
│   │   │   │   ├── webhooks.ts
│   │   │   │   └── analytics.ts
│   │   │   ├── services/
│   │   │   │   ├── ChannelService.ts
│   │   │   │   ├── MessageService.ts
│   │   │   │   ├── AIService.ts
│   │   │   │   ├── WebhookService.ts
│   │   │   │   ├── AnalyticsService.ts
│   │   │   │   └── NotificationService.ts
│   │   │   ├── queues/
│   │   │   │   ├── messageQueue.ts
│   │   │   │   ├── aiQueue.ts
│   │   │   │   └── webhookQueue.ts
│   │   │   ├── integrations/
│   │   │   │   ├── meta/
│   │   │   │   │   ├── MetaClient.ts
│   │   │   │   │   ├── WhatsAppHandler.ts
│   │   │   │   │   └── InstagramHandler.ts
│   │   │   │   ├── claude/
│   │   │   │   │   └── ClaudeClient.ts
│   │   │   │   └── webhooks/
│   │   │   │       └── WebhookHandler.ts
│   │   │   ├── middleware/
│   │   │   │   ├── auth.ts
│   │   │   │   ├── validation.ts
│   │   │   │   └── errorHandler.ts
│   │   │   ├── types/
│   │   │   │   ├── index.ts
│   │   │   │   └── channels.ts
│   │   │   ├── utils/
│   │   │   │   ├── logger.ts
│   │   │   │   ├── encryption.ts
│   │   │   │   └── validators.ts
│   │   │   ├── prisma/
│   │   │   │   └── schema.prisma
│   │   │   └── index.ts
│   │   ├── .env.example
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── web/                          # Frontend Next.js
│       ├── app/
│       │   ├── (auth)/
│       │   │   ├── login/page.tsx
│       │   │   └── register/page.tsx
│       │   ├── (dashboard)/
│       │   │   ├── layout.tsx
│       │   │   ├── page.tsx          # Dashboard principal
│       │   │   ├── chat/[id]/page.tsx
│       │   │   ├── channels/page.tsx
│       │   │   ├── analytics/page.tsx
│       │   │   ├── ai-settings/page.tsx
│       │   │   └── webhooks/page.tsx
│       │   ├── api/
│       │   │   └── socket/route.ts
│       │   └── layout.tsx
│       ├── components/
│       │   ├── chat/
│       │   │   ├── ChatWindow.tsx
│       │   │   ├── ConversationList.tsx
│       │   │   ├── MessageInput.tsx
│       │   │   └── AISuggestions.tsx
│       │   ├── dashboard/
│       │   │   ├── MetricsCards.tsx
│       │   │   ├── ChannelChart.tsx
│       │   │   └── RecentActivity.tsx
│       │   ├── shared/
│       │   │   ├── Sidebar.tsx
│       │   │   ├── Header.tsx
│       │   │   └── SearchBar.tsx
│       │   └── ui/
│       │       └── [components base]
│       ├── hooks/
│       │   ├── useChat.ts
│       │   ├── useWebSocket.ts
│       │   └── useAnalytics.ts
│       ├── lib/
│       │   ├── api.ts
│       │   ├── socket.ts
│       │   └── validators.ts
│       ├── styles/
│       │   └── globals.css
│       ├── public/
│       └── package.json
│
├── packages/
│   ├── shared-types/               # Tipos compartidos
│   │   ├── index.ts
│   │   ├── messages.ts
│   │   ├── conversations.ts
│   │   └── channels.ts
│   │
│   ├── database/                   # Configuración DB
│   │   ├── seed.ts
│   │   └── migrations/
│   │
│   └── ui/                         # Componentes UI reutilizables
│       └── components/
│
├── docker-compose.yml
├── turbo.json
├── package.json
├── .env.example
└── README.md
```

---

## 🗄️ Modelo de Base de Datos (Prisma)

```prisma
// schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model Organization {
  id            String   @id @default(cuid())
  name          String
  slug          String   @unique
  logo          String?
  plan          String   @default("starter") // starter, pro, enterprise
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  channels      Channel[]
  conversations Conversation[]
  users         User[]
  webhooks      WebhookConfig[]
  aiSettings    AISettings?
}

model User {
  id            String   @id @default(cuid())
  email         String   @unique
  name          String
  password      String
  role          String   @default("agent") // admin, supervisor, agent
  organizationId String
  organization  Organization @relation(fields: [organizationId], references: [id])
  
  assignedChats Conversation[] @relation("assignedAgent")
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model Channel {
  id            String   @id @default(cuid())
  type          String   // whatsapp, instagram, facebook, web
  name          String
  status        String   @default("inactive") // active, inactive, paused
  accessToken   String   @db.Text
  refreshToken  String?  @db.Text
  phoneNumber   String?
  pageId        String?
  metadata      Json?
  organizationId String
  organization  Organization @relation(fields: [organizationId], references: [id])
  
  conversations Conversation[]
  webhooks      WebhookEvent[]
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@unique([organizationId, type, pageId])
}

model Conversation {
  id            String   @id @default(cuid())
  externalId    String   // ID del canal externo (WABAId, InstagramId, etc)
  contactName   String
  contactPhone  String?
  contactEmail  String?
  status        String   @default("active") // active, resolved, archived
  channelId     String
  channel       Channel  @relation(fields: [channelId], references: [id])
  organizationId String
  organization  Organization @relation(fields: [organizationId], references: [id])
  
  assignedAgentId String?
  assignedAgent User?    @relation("assignedAgent", fields: [assignedAgentId], references: [id])
  
  messages      Message[]
  sentiment     Float?   // Score de sentimiento (-1 a 1)
  tags          String[] // Para categorización
  priority      String   @default("normal") // low, normal, high
  
  lastMessageAt DateTime?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@index([organizationId])
  @@index([channelId])
  @@index([status])
}

model Message {
  id            String   @id @default(cuid())
  externalId    String   // ID del mensaje en el canal
  conversationId String
  conversation  Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  
  direction     String   // inbound, outbound
  type          String   // text, image, video, document, audio
  content       String   @db.Text
  mediaUrl      String?
  
  isAIGenerated Boolean  @default(false)
  aiModel       String?  // claude-3-5-sonnet, etc
  aiConfidence  Float?
  
  senderId      String?  // ID del contacto o usuario
  senderName    String
  
  metadata      Json?
  deliveryStatus String  @default("sent") // sent, delivered, read, failed
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@index([conversationId])
  @@index([createdAt])
}

model AISettings {
  id            String   @id @default(cuid())
  organizationId String   @unique
  organization  Organization @relation(fields: [organizationId], references: [id])
  
  enabled       Boolean  @default(true)
  model         String   @default("claude-3-5-sonnet")
  temperature   Float    @default(0.7)
  maxTokens     Int      @default(500)
  
  systemPrompt  String   @db.Text
  responseType  String   @default("suggestion") // suggestion, auto-respond, hybrid
  
  enableSentimentAnalysis Boolean @default(true)
  enableAutoResponses Boolean @default(false)
  autoResponseThreshold Float @default(0.8)
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model WebhookConfig {
  id            String   @id @default(cuid())
  organizationId String
  organization  Organization @relation(fields: [organizationId], references: [id])
  
  url           String
  events        String[] // message.created, conversation.updated, etc
  active        Boolean  @default(true)
  secret        String   // Para validar webhooks
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model WebhookEvent {
  id            String   @id @default(cuid())
  channelId     String
  channel       Channel  @relation(fields: [channelId], references: [id])
  
  event         String   // webhook event type
  payload       Json     @db.Json
  status        String   @default("pending") // pending, processed, failed
  retries       Int      @default(0)
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@index([status, createdAt])
}

model Analytics {
  id            String   @id @default(cuid())
  organizationId String
  
  date          DateTime
  channel       String
  
  messagesInbound Int
  messagesOutbound Int
  conversations Int
  avgResponseTime Int // en segundos
  sentiment     Float
  
  createdAt     DateTime @default(now())

  @@unique([organizationId, date, channel])
  @@index([organizationId, date])
}
```

---

## 🔌 Integración Meta Business Platform

### Configuración de Webhooks

```typescript
// src/integrations/meta/WebhookHandler.ts
import { Router } from 'express';
import crypto from 'crypto';
import { MessageService } from '../../services/MessageService';

const router = Router();

const WEBHOOK_VERIFY_TOKEN = process.env.META_WEBHOOK_VERIFY_TOKEN;
const APP_SECRET = process.env.META_APP_SECRET;

// Verificación de webhooks (GET)
router.get('/webhooks/meta', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === WEBHOOK_VERIFY_TOKEN) {
    console.log('Webhook verificado');
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// Recibir eventos (POST)
router.post('/webhooks/meta', async (req, res) => {
  const signature = req.headers['x-hub-signature-256'] as string;

  // Validar firma
  const body = JSON.stringify(req.body);
  const hash = crypto
    .createHmac('sha256', APP_SECRET!)
    .update(body)
    .digest('hex');

  const expected = `sha256=${hash}`;

  if (signature !== expected) {
    console.error('Firma inválida');
    return res.sendStatus(403);
  }

  const entry = req.body.entry[0];
  
  if (entry.changes) {
    for (const change of entry.changes) {
      const value = change.value;

      if (value.messages) {
        // Mensajes entrantes
        for (const message of value.messages) {
          await MessageService.handleIncomingMessage({
            channelType: 'whatsapp',
            externalId: message.id,
            conversationId: value.messages[0].from,
            content: message.text?.body || '',
            timestamp: message.timestamp,
            metadata: message,
          });
        }
      }

      if (value.statuses) {
        // Actualizaciones de estado
        for (const status of value.statuses) {
          await MessageService.updateMessageStatus(
            status.id,
            status.status // sent, delivered, read, failed
          );
        }
      }
    }
  }

  res.sendStatus(200);
});

export default router;
```

### Meta Client para Envío de Mensajes

```typescript
// src/integrations/meta/MetaClient.ts
import axios from 'axios';

export class MetaClient {
  private apiUrl = 'https://graph.instagram.com/v18.0';
  private accessToken: string;
  private phoneNumberId: string;

  constructor(accessToken: string, phoneNumberId: string) {
    this.accessToken = accessToken;
    this.phoneNumberId = phoneNumberId;
  }

  async sendMessage(
    to: string,
    message: string,
    type: 'text' | 'image' | 'document' = 'text'
  ) {
    try {
      const payload: any = {
        messaging_product: 'whatsapp',
        to,
      };

      if (type === 'text') {
        payload.message = {
          preview_url: false,
          body: message,
        };
      } else if (type === 'image') {
        payload.message = {
          type: 'image',
          image: { link: message },
        };
      }

      const response = await axios.post(
        `${this.apiUrl}/${this.phoneNumberId}/messages`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error enviando mensaje:', error);
      throw error;
    }
  }

  async markMessageAsRead(messageId: string) {
    try {
      await axios.post(
        `${this.apiUrl}/${messageId}`,
        {
          status: 'read',
        },
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        }
      );
    } catch (error) {
      console.error('Error marcando mensaje:', error);
      throw error;
    }
  }

  async getContactInfo(phoneNumber: string) {
    try {
      const response = await axios.get(
        `${this.apiUrl}/${phoneNumber}`,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error obteniendo info:', error);
      throw error;
    }
  }
}
```

---

## 🤖 Servicio de IA con Claude API

```typescript
// src/integrations/claude/ClaudeClient.ts
import Anthropic from '@anthropic-ai/sdk';

export class ClaudeAIService {
  private client: Anthropic;
  private model = 'claude-3-5-sonnet-20241022';

  constructor(apiKey: string) {
    this.client = new Anthropic({ apiKey });
  }

  async generateSuggestions(
    conversationHistory: Array<{ role: string; content: string }>,
    context: { sentiment: string; topic: string }
  ): Promise<string[]> {
    try {
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 1000,
        system: `Eres un asistente de servicio al cliente experto. Analiza el contexto de la conversación y proporciona 3 respuestas sugeridas.
        
Contexto:
- Sentimiento: ${context.sentiment}
- Tema: ${context.topic}

Proporciona exactamente 3 sugerencias de respuesta breves (máximo 150 caracteres cada una), profesionales y empáticas. Devuelve SOLO las sugerencias numeradas, sin explicaciones adicionales.`,
        messages: conversationHistory,
      });

      const text = response.content[0].type === 'text' ? response.content[0].text : '';
      const suggestions = text
        .split('\n')
        .filter(line => line.match(/^\d\./))
        .map(line => line.replace(/^\d\.\s*/, '').trim());

      return suggestions;
    } catch (error) {
      console.error('Error generando sugerencias:', error);
      throw error;
    }
  }

  async analyzeMessage(
    message: string
  ): Promise<{
    sentiment: number; // -1 a 1
    sentiment_label: string;
    category: string;
    priority: string;
    should_escalate: boolean;
  }> {
    try {
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 500,
        system: `Analiza el siguiente mensaje de cliente y devuelve un JSON con: sentiment (número -1 a 1), sentiment_label (negative/neutral/positive), category, priority (low/normal/high), should_escalate (boolean).`,
        messages: [
          {
            role: 'user',
            content: `Analiza: "${message}"`,
          },
        ],
      });

      const text = response.content[0].type === 'text' ? response.content[0].text : '{}';
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error('Error analizando mensaje:', error);
      throw error;
    }
  }

  async generateAutoResponse(
    message: string,
    conversationContext: string,
    tone: string = 'professional'
  ): Promise<string> {
    try {
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 300,
        system: `Eres un agente de servicio al cliente. Genera una respuesta apropiada.
Tono: ${tone}
Contexto: ${conversationContext}

Responde de forma breve (máximo 2 oraciones), profesional y útil.`,
        messages: [
          {
            role: 'user',
            content: message,
          },
        ],
      });

      return response.content[0].type === 'text' ? response.content[0].text : '';
    } catch (error) {
      console.error('Error generando respuesta:', error);
      throw error;
    }
  }
}
```

---

## 📨 Servicio de Mensajes con Colas

```typescript
// src/services/MessageService.ts
import { PrismaClient } from '@prisma/client';
import Queue from 'bull';
import { ClaudeAIService } from '../integrations/claude/ClaudeClient';
import { MetaClient } from '../integrations/meta/MetaClient';

export class MessageService {
  private prisma = new PrismaClient();
  private messageQueue: Queue.Queue;
  private aiQueue: Queue.Queue;
  private aiService: ClaudeAIService;

  constructor() {
    this.messageQueue = new Queue('messages', {
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
      },
    });

    this.aiQueue = new Queue('ai-processing', {
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
      },
    });

    this.aiService = new ClaudeAIService(process.env.CLAUDE_API_KEY!);
    this.setupQueueProcessors();
  }

  private setupQueueProcessors() {
    // Procesar mensajes
    this.messageQueue.process(async (job) => {
      const { message, conversationId } = job.data;
      
      try {
        // Guardar en BD
        const savedMessage = await this.prisma.message.create({
          data: {
            conversationId,
            direction: 'inbound',
            type: 'text',
            content: message.text,
            senderName: message.senderName,
            metadata: message.metadata,
            deliveryStatus: 'delivered',
          },
        });

        // Encolar análisis de IA
        await this.aiQueue.add(
          {
            messageId: savedMessage.id,
            content: savedMessage.content,
            conversationId,
          },
          { priority: 5 }
        );

        return { success: true, messageId: savedMessage.id };
      } catch (error) {
        console.error('Error procesando mensaje:', error);
        throw error;
      }
    });

    // Procesar IA
    this.aiQueue.process(async (job) => {
      const { messageId, content, conversationId } = job.data;

      try {
        // Analizar mensaje
        const analysis = await this.aiService.analyzeMessage(content);

        // Actualizar mensaje con análisis
        await this.prisma.message.update({
          where: { id: messageId },
          data: {
            aiModel: 'claude-3-5-sonnet',
            aiConfidence: Math.abs(analysis.sentiment),
          },
        });

        // Actualizar sentimiento de conversación
        await this.prisma.conversation.update({
          where: { id: conversationId },
          data: {
            sentiment: analysis.sentiment,
            priority: analysis.priority,
            tags: { push: analysis.category },
          },
        });

        // Si requiere escalación, notificar
        if (analysis.should_escalate) {
          // Emit WebSocket event para agentes
          console.log(`Escalando conversación: ${conversationId}`);
        }

        return { success: true };
      } catch (error) {
        console.error('Error procesando IA:', error);
        throw error;
      }
    });
  }

  async handleIncomingMessage(data: {
    channelType: string;
    externalId: string;
    conversationId: string;
    content: string;
    timestamp: string;
    metadata: any;
  }) {
    // Encontrar o crear conversación
    let conversation = await this.prisma.conversation.findUnique({
      where: { externalId: data.conversationId },
    });

    if (!conversation) {
      // Obtener canal
      const channel = await this.prisma.channel.findFirst({
        where: { type: data.channelType },
      });

      conversation = await this.prisma.conversation.create({
        data: {
          externalId: data.conversationId,
          channelId: channel!.id,
          organizationId: channel!.organizationId,
          contactName: data.metadata.from || 'Unknown',
          contactPhone: data.conversationId,
        },
      });
    }

    // Encolar mensaje para procesamiento
    await this.messageQueue.add(
      {
        message: {
          id: data.externalId,
          text: data.content,
          senderName: data.metadata.from || 'Customer',
          metadata: data.metadata,
        },
        conversationId: conversation.id,
      },
      { priority: 10, attempts: 3, backoff: { type: 'exponential', delay: 2000 } }
    );

    return conversation;
  }

  async sendMessage(
    conversationId: string,
    content: string,
    userId: string,
    isAI: boolean = false
  ) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { channel: true },
    });

    if (!conversation) throw new Error('Conversación no encontrada');

    // Crear mensaje en BD
    const message = await this.prisma.message.create({
      data: {
        conversationId,
        direction: 'outbound',
        type: 'text',
        content,
        senderName: isAI ? 'AI Assistant' : `User ${userId}`,
        isAIGenerated: isAI,
        aiModel: isAI ? 'claude-3-5-sonnet' : undefined,
        deliveryStatus: 'sent',
      },
    });

    // Enviar a través del canal
    if (conversation.channel.type === 'whatsapp') {
      const metaClient = new MetaClient(
        conversation.channel.accessToken,
        conversation.channel.phoneNumber!
      );

      try {
        await metaClient.sendMessage(
          conversation.externalId,
          content,
          'text'
        );

        await this.prisma.message.update({
          where: { id: message.id },
          data: { deliveryStatus: 'delivered' },
        });
      } catch (error) {
        await this.prisma.message.update({
          where: { id: message.id },
          data: { deliveryStatus: 'failed' },
        });
        throw error;
      }
    }

    return message;
  }

  async updateMessageStatus(
    externalMessageId: string,
    status: string
  ) {
    await this.prisma.message.updateMany({
      where: { externalId: externalMessageId },
      data: { deliveryStatus: status },
    });
  }
}
```

---

## 🚀 Deployment

### Docker Compose para Desarrollo

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: omnichannel
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  api:
    build:
      context: .
      dockerfile: apps/api/Dockerfile
    environment:
      DATABASE_URL: postgresql://user:password@postgres:5432/omnichannel
      REDIS_URL: redis://redis:6379
      CLAUDE_API_KEY: ${CLAUDE_API_KEY}
      META_ACCESS_TOKEN: ${META_ACCESS_TOKEN}
      META_WEBHOOK_VERIFY_TOKEN: ${META_WEBHOOK_VERIFY_TOKEN}
      META_APP_SECRET: ${META_APP_SECRET}
    ports:
      - "3001:3001"
    depends_on:
      - postgres
      - redis
    volumes:
      - ./apps/api/src:/app/src

  web:
    build:
      context: .
      dockerfile: apps/web/Dockerfile
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:3001
      NEXT_PUBLIC_WS_URL: ws://localhost:3001
    ports:
      - "3000:3000"
    depends_on:
      - api
    volumes:
      - ./apps/web:/app

volumes:
  postgres_data:
  redis_data:
```

### Variables de Entorno (.env.example)

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/omnichannel

# Redis
REDIS_URL=redis://localhost:6379

# Meta Business Platform
META_ACCESS_TOKEN=your_access_token
META_WEBHOOK_VERIFY_TOKEN=your_verify_token
META_APP_SECRET=your_app_secret
META_APP_ID=your_app_id
META_PHONE_NUMBER_ID=your_phone_number_id

# Claude AI
CLAUDE_API_KEY=your_claude_api_key

# Application
NODE_ENV=development
API_PORT=3001
API_URL=http://localhost:3001
WEB_URL=http://localhost:3000

# JWT
JWT_SECRET=your_jwt_secret

# Encryption
ENCRYPTION_KEY=your_encryption_key
```

### Deploy a Railway

```bash
# Login
railway login

# Create project
railway init

# Deploy
railway up
```

---

## 📊 Métricas y Analítica

```typescript
// src/services/AnalyticsService.ts
export class AnalyticsService {
  async getDashboardMetrics(organizationId: string, days: number = 30) {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const metrics = {
      totalMessages: 0,
      totalConversations: 0,
      avgResponseTime: 0,
      sentimentScore: 0,
      channelBreakdown: {},
      hourlyTrend: [],
    };

    // Implementar queries agregadas
    return metrics;
  }
}
```

---

## 🔐 Seguridad

1. **Validación de Webhooks:** Verificación de firma SHA256
2. **Autenticación:** JWT con refresh tokens
3. **Encriptación:** End-to-end para datos sensibles
4. **Rate Limiting:** Por usuario y por IP
5. **CORS:** Configurado correctamente
6. **Secrets:** Usando variables de entorno

---

## ✅ Checklist de Implementación

- [ ] Configurar variables de entorno
- [ ] Setup base de datos y migraciones Prisma
- [ ] Integración Meta Business Platform
- [ ] Webhook listeners activos
- [ ] Colas Bull configuradas
- [ ] Claude API integrada
- [ ] WebSocket para tiempo real
- [ ] Autenticación y autorización
- [ ] Tests unitarios
- [ ] Tests e2e
- [ ] Monitoreo y logging
- [ ] Deploy a producción

---

## 📚 Referencias

- [Meta Business Platform Docs](https://developers.facebook.com/docs/whatsapp/cloud-api)
- [Claude API Documentation](https://docs.anthropic.com/)
- [Prisma ORM](https://www.prisma.io/)
- [Socket.io Real-time](https://socket.io/)
- [Bull Queue](https://github.com/OptimalBits/bull)
- [Next.js 14 App Router](https://nextjs.org/)

---

**Desarrollado con** ⚡ **Stack moderno y escalable**
