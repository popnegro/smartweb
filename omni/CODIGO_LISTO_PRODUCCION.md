# Código Listo para Producción - Plataforma Omnicanal

## 📦 Tipos TypeScript Compartidos

```typescript
// packages/shared-types/index.ts

export type ChannelType = 'whatsapp' | 'instagram' | 'facebook' | 'web';
export type MessageDirection = 'inbound' | 'outbound';
export type MessageType = 'text' | 'image' | 'video' | 'document' | 'audio';
export type DeliveryStatus = 'sent' | 'delivered' | 'read' | 'failed';
export type ConversationStatus = 'active' | 'resolved' | 'archived';
export type UserRole = 'admin' | 'supervisor' | 'agent';

// ===== Conversation Types =====
export interface Conversation {
  id: string;
  externalId: string;
  contactName: string;
  contactPhone?: string;
  contactEmail?: string;
  status: ConversationStatus;
  channelId: string;
  organizationId: string;
  assignedAgentId?: string;
  sentiment?: number; // -1 to 1
  tags: string[];
  priority: 'low' | 'normal' | 'high';
  lastMessageAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ConversationWithMessages extends Conversation {
  messages: Message[];
  channel: Channel;
  assignedAgent?: User;
}

export interface CreateConversationDTO {
  contactName: string;
  contactPhone?: string;
  channelId: string;
}

// ===== Message Types =====
export interface Message {
  id: string;
  externalId: string;
  conversationId: string;
  direction: MessageDirection;
  type: MessageType;
  content: string;
  mediaUrl?: string;
  isAIGenerated: boolean;
  aiModel?: string;
  aiConfidence?: number;
  senderId?: string;
  senderName: string;
  metadata?: Record<string, any>;
  deliveryStatus: DeliveryStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateMessageDTO {
  conversationId: string;
  type: MessageType;
  content: string;
  mediaUrl?: string;
  isAI?: boolean;
}

export interface MessageAnalysis {
  sentiment: number;
  sentiment_label: 'negative' | 'neutral' | 'positive';
  category: string;
  priority: 'low' | 'normal' | 'high';
  should_escalate: boolean;
}

// ===== Channel Types =====
export interface Channel {
  id: string;
  type: ChannelType;
  name: string;
  status: 'active' | 'inactive' | 'paused';
  phoneNumber?: string;
  pageId?: string;
  metadata?: Record<string, any>;
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChannelConfig {
  type: ChannelType;
  accessToken: string;
  refreshToken?: string;
  phoneNumberId?: string;
  pageId?: string;
}

// ===== User Types =====
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthPayload {
  user: User;
  token: string;
  expiresIn: number;
}

// ===== WebSocket Events =====
export interface WebSocketMessage<T = any> {
  type: string;
  payload: T;
  timestamp: Date;
}

export interface ChatEventPayload {
  conversationId: string;
  message: Message;
}

export interface ConversationUpdatePayload {
  conversationId: string;
  updates: Partial<Conversation>;
}

export interface TypingIndicatorPayload {
  conversationId: string;
  userId: string;
  isTyping: boolean;
}

// ===== API Response Types =====
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: Date;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ===== Dashboard Types =====
export interface DashboardMetrics {
  totalMessages: number;
  totalConversations: number;
  avgResponseTime: number;
  sentimentScore: number;
  channelBreakdown: Record<ChannelType, number>;
  hourlyTrend: { hour: string; count: number }[];
  topCategories: { name: string; count: number }[];
}

export interface ChannelMetrics {
  channel: ChannelType;
  messagesInbound: number;
  messagesOutbound: number;
  conversations: number;
  avgResponseTime: number;
  sentiment: number;
}
```

---

## 🛣️ Rutas API Express

```typescript
// apps/api/src/routes/messages.ts
import { Router, Request, Response } from 'express';
import { MessageService } from '../services/MessageService';
import { auth, validate } from '../middleware';
import { messageSchema } from '../utils/validators';

const router = Router();
const messageService = new MessageService();

// Crear mensaje
router.post(
  '/',
  auth,
  validate(messageSchema),
  async (req: Request, res: Response) => {
    try {
      const { conversationId, content, type } = req.body;
      const userId = req.user!.id;

      const message = await messageService.sendMessage(
        conversationId,
        content,
        userId,
        false
      );

      res.json({
        success: true,
        data: message,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: (error as Error).message,
      });
    }
  }
);

// Obtener mensajes de conversación
router.get(
  '/conversation/:conversationId',
  auth,
  async (req: Request, res: Response) => {
    try {
      const { conversationId } = req.params;
      const { page = 1, pageSize = 50 } = req.query;

      const messages = await MessageService.getConversationMessages(
        conversationId,
        parseInt(page as string),
        parseInt(pageSize as string)
      );

      res.json({
        success: true,
        data: messages,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: (error as Error).message,
      });
    }
  }
);

// Marcar mensaje como leído
router.patch(
  '/:messageId/read',
  auth,
  async (req: Request, res: Response) => {
    try {
      const { messageId } = req.params;

      const message = await messageService.markAsRead(messageId);

      res.json({
        success: true,
        data: message,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: (error as Error).message,
      });
    }
  }
);

// Obtener sugerencias de IA
router.get(
  '/:conversationId/ai-suggestions',
  auth,
  async (req: Request, res: Response) => {
    try {
      const { conversationId } = req.params;

      const suggestions = await messageService.getAISuggestions(
        conversationId
      );

      res.json({
        success: true,
        data: suggestions,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: (error as Error).message,
      });
    }
  }
);

export default router;
```

```typescript
// apps/api/src/routes/conversations.ts
import { Router, Request, Response } from 'express';
import { ConversationService } from '../services/ConversationService';
import { auth, validate } from '../middleware';
import { conversationSchema } from '../utils/validators';

const router = Router();
const conversationService = new ConversationService();

// Listar conversaciones
router.get('/', auth, async (req: Request, res: Response) => {
  try {
    const organizationId = req.user!.organizationId;
    const { status, channel, search, page = 1, pageSize = 20 } = req.query;

    const conversations = await conversationService.getConversations(
      organizationId,
      {
        status: status as string,
        channel: channel as string,
        search: search as string,
        page: parseInt(page as string),
        pageSize: parseInt(pageSize as string),
      }
    );

    res.json({
      success: true,
      data: conversations,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

// Obtener conversación específica
router.get('/:conversationId', auth, async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params;

    const conversation = await conversationService.getConversationWithMessages(
      conversationId
    );

    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: 'Conversación no encontrada',
      });
    }

    res.json({
      success: true,
      data: conversation,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

// Actualizar conversación
router.patch(
  '/:conversationId',
  auth,
  validate(conversationSchema),
  async (req: Request, res: Response) => {
    try {
      const { conversationId } = req.params;
      const { status, assignedAgentId, tags, priority } = req.body;

      const conversation = await conversationService.updateConversation(
        conversationId,
        {
          status,
          assignedAgentId,
          tags,
          priority,
        }
      );

      res.json({
        success: true,
        data: conversation,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: (error as Error).message,
      });
    }
  }
);

// Asignar conversación a agente
router.patch(
  '/:conversationId/assign',
  auth,
  async (req: Request, res: Response) => {
    try {
      const { conversationId } = req.params;
      const { agentId } = req.body;

      const conversation = await conversationService.assignToAgent(
        conversationId,
        agentId
      );

      res.json({
        success: true,
        data: conversation,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: (error as Error).message,
      });
    }
  }
);

export default router;
```

```typescript
// apps/api/src/routes/ai.ts
import { Router, Request, Response } from 'express';
import { ClaudeAIService } from '../integrations/claude/ClaudeClient';
import { auth } from '../middleware';

const router = Router();
const aiService = new ClaudeAIService(process.env.CLAUDE_API_KEY!);

// Generar respuesta automática
router.post(
  '/auto-response',
  auth,
  async (req: Request, res: Response) => {
    try {
      const { conversationId, messageId } = req.body;

      // Obtener contexto de conversación
      // (implementar lógica de recuperación)

      const response = await aiService.generateAutoResponse(
        'User message content',
        'Conversation context',
        'professional'
      );

      res.json({
        success: true,
        data: {
          response,
          confidence: 0.85,
        },
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: (error as Error).message,
      });
    }
  }
);

// Analizar sentimiento
router.post(
  '/analyze',
  auth,
  async (req: Request, res: Response) => {
    try {
      const { message } = req.body;

      const analysis = await aiService.analyzeMessage(message);

      res.json({
        success: true,
        data: analysis,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: (error as Error).message,
      });
    }
  }
);

export default router;
```

---

## ⚛️ Componentes React

```typescript
// apps/web/components/chat/ChatWindow.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Send, Loader } from 'lucide-react';
import { Message } from '@shared-types';
import { useWebSocket } from '@/hooks/useWebSocket';

interface ChatWindowProps {
  conversationId: string;
  messages: Message[];
  onSendMessage: (content: string) => Promise<void>;
  isLoading?: boolean;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  conversationId,
  messages,
  onSendMessage,
  isLoading = false,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { isConnected } = useWebSocket();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    setIsSending(true);
    try {
      await onSendMessage(inputValue);
      setInputValue('');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-slate-900 to-slate-950">
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader className="w-8 h-8 animate-spin text-cyan-500" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-500">
            <p>Inicia la conversación</p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.direction === 'outbound'
                    ? 'justify-end'
                    : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.direction === 'outbound'
                      ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white'
                      : 'bg-slate-800 text-slate-100'
                  } ${message.isAIGenerated ? 'border-l-2 border-cyan-400' : ''}`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className="text-xs opacity-60 mt-1">
                    {new Date(message.createdAt).toLocaleTimeString()}
                  </p>
                  {message.isAIGenerated && (
                    <p className="text-xs opacity-70 mt-1">
                      🤖 AI • {Math.round((message.aiConfidence || 0) * 100)}%
                    </p>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-slate-800 bg-slate-900 p-4">
        <form onSubmit={handleSubmit} className="flex gap-3">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isSending || !isConnected}
            placeholder="Escribe tu respuesta..."
            className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-sm focus:outline-none focus:border-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={isSending || !isConnected || !inputValue.trim()}
            className="px-4 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white font-medium flex items-center gap-2 transition"
          >
            {isSending ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">Enviar</span>
          </button>
        </form>

        {!isConnected && (
          <p className="text-xs text-red-500 mt-2">
            Reconectando...
          </p>
        )}
      </div>
    </div>
  );
};
```

```typescript
// apps/web/components/chat/AISuggestions.tsx
'use client';

import React from 'react';
import { Zap } from 'lucide-react';

interface AISuggestionsProps {
  suggestions: Array<{
    id: string | number;
    text: string;
    confidence: number;
  }>;
  onSelectSuggestion: (text: string) => void;
  isLoading?: boolean;
}

export const AISuggestions: React.FC<AISuggestionsProps> = ({
  suggestions,
  onSelectSuggestion,
  isLoading = false,
}) => {
  if (!suggestions.length) return null;

  return (
    <div className="px-4 pb-4 space-y-2">
      <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
        <Zap className="w-3 h-3" />
        Sugerencias de IA
      </div>
      <div className="space-y-2">
        {suggestions.map((suggestion) => (
          <button
            key={suggestion.id}
            onClick={() => onSelectSuggestion(suggestion.text)}
            disabled={isLoading}
            className="w-full p-3 text-left text-xs bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 hover:border-cyan-500/30 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            <p className="text-slate-300 group-hover:text-white transition line-clamp-2">
              {suggestion.text}
            </p>
            <p className="text-slate-500 text-xs mt-1">
              Confianza: {suggestion.confidence}%
            </p>
          </button>
        ))}
      </div>
    </div>
  );
};
```

```typescript
// apps/web/components/chat/ConversationList.tsx
'use client';

import React, { useState } from 'react';
import { Search, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Conversation } from '@shared-types';

interface ConversationListProps {
  conversations: Conversation[];
  selectedId?: string;
  onSelectConversation: (id: string) => void;
  isLoading?: boolean;
}

const priorityColors = {
  low: 'text-slate-400',
  normal: 'text-blue-400',
  high: 'text-red-400',
};

const sentimentIcons = {
  positive: <CheckCircle className="w-4 h-4 text-green-500" />,
  neutral: <Clock className="w-4 h-4 text-slate-500" />,
  negative: <AlertCircle className="w-4 h-4 text-red-500" />,
};

export const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  selectedId,
  onSelectConversation,
  isLoading,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filtered = conversations.filter((conv) => {
    const matchesSearch =
      conv.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.contactPhone?.includes(searchTerm);
    const matchesStatus =
      filterStatus === 'all' || conv.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex flex-col h-full bg-slate-900">
      {/* Search */}
      <div className="p-4 border-b border-slate-800">
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Buscar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2 text-xs">
          {['all', 'active', 'resolved', 'archived'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-2 py-1 rounded transition ${
                filterStatus === status
                  ? 'bg-cyan-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              {status === 'all' ? 'Todas' : status}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 text-center text-slate-500">Cargando...</div>
        ) : filtered.length === 0 ? (
          <div className="p-4 text-center text-slate-500">
            No hay conversaciones
          </div>
        ) : (
          filtered.map((conv) => (
            <button
              key={conv.id}
              onClick={() => onSelectConversation(conv.id)}
              className={`w-full p-3 border-b border-slate-800 text-left hover:bg-slate-800/50 transition ${
                selectedId === conv.id ? 'bg-slate-800' : ''
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{conv.contactName}</p>
                  <p className="text-xs text-slate-400 truncate">
                    {conv.contactPhone}
                  </p>
                </div>
                {conv.sentiment !== undefined && (
                  <>
                    {conv.sentiment > 0.3 && sentimentIcons.positive}
                    {conv.sentiment <= 0.3 && conv.sentiment >= -0.3 && sentimentIcons.neutral}
                    {conv.sentiment < -0.3 && sentimentIcons.negative}
                  </>
                )}
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className={`text-xs ${priorityColors[conv.priority]}`}>
                  {conv.priority.toUpperCase()}
                </span>
                <span className="text-xs text-slate-500">
                  {conv.lastMessageAt
                    ? new Date(conv.lastMessageAt).toLocaleTimeString()
                    : 'Aún sin mensajes'}
                </span>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
};
```

---

## 🎣 Custom Hooks

```typescript
// apps/web/hooks/useWebSocket.ts
'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { ChatEventPayload, ConversationUpdatePayload } from '@shared-types';

export const useWebSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const socketRef = useRef<Socket | null>(null);
  const reconnectAttemptsRef = useRef(0);

  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001', {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    socket.on('connect', () => {
      console.log('WebSocket conectado');
      setIsConnected(true);
      setIsLoading(false);
      reconnectAttemptsRef.current = 0;
    });

    socket.on('disconnect', () => {
      console.log('WebSocket desconectado');
      setIsConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.error('Error de conexión WebSocket:', error);
      setIsLoading(false);
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, []);

  const on = useCallback(
    (event: string, callback: (...args: any[]) => void) => {
      if (socketRef.current) {
        socketRef.current.on(event, callback);
      }
    },
    []
  );

  const off = useCallback((event: string, callback?: (...args: any[]) => void) => {
    if (socketRef.current) {
      socketRef.current.off(event, callback);
    }
  }, []);

  const emit = useCallback(
    (event: string, data?: any) => {
      if (socketRef.current?.connected) {
        socketRef.current.emit(event, data);
      }
    },
    []
  );

  return {
    socket: socketRef.current,
    isConnected,
    isLoading,
    on,
    off,
    emit,
  };
};
```

```typescript
// apps/web/hooks/useChat.ts
'use client';

import { useState, useCallback, useEffect } from 'react';
import { useFetch } from './useFetch';
import { useWebSocket } from './useWebSocket';
import { Message, Conversation } from '@shared-types';

interface UseChatOptions {
  conversationId: string;
}

export const useChat = ({ conversationId }: UseChatOptions) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { emit, on, off } = useWebSocket();
  const { post, get } = useFetch();

  // Cargar mensajes iniciales
  useEffect(() => {
    const loadMessages = async () => {
      setIsLoading(true);
      try {
        const response = await get(`/api/messages/conversation/${conversationId}`);
        if (response.success) {
          setMessages(response.data || []);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadMessages();
  }, [conversationId, get]);

  // Escuchar nuevos mensajes en tiempo real
  useEffect(() => {
    const handleNewMessage = (payload: { message: Message }) => {
      setMessages((prev) => [...prev, payload.message]);
    };

    on('message:new', handleNewMessage);

    return () => {
      off('message:new', handleNewMessage);
    };
  }, [on, off]);

  const sendMessage = useCallback(
    async (content: string, type = 'text') => {
      try {
        const response = await post('/api/messages', {
          conversationId,
          content,
          type,
        });

        if (response.success) {
          setMessages((prev) => [...prev, response.data]);
          return response.data;
        }
      } catch (error) {
        console.error('Error enviando mensaje:', error);
        throw error;
      }
    },
    [conversationId, post]
  );

  return {
    messages,
    isLoading,
    sendMessage,
  };
};
```

---

## 🛠️ Utilidades

```typescript
// apps/api/src/utils/validators.ts
import { z } from 'zod';

export const messageSchema = z.object({
  conversationId: z.string().uuid(),
  content: z.string().min(1).max(5000),
  type: z.enum(['text', 'image', 'video', 'document', 'audio']).default('text'),
  mediaUrl: z.string().url().optional(),
});

export const conversationSchema = z.object({
  status: z.enum(['active', 'resolved', 'archived']).optional(),
  assignedAgentId: z.string().uuid().optional(),
  tags: z.array(z.string()).optional(),
  priority: z.enum(['low', 'normal', 'high']).optional(),
});

export const channelSchema = z.object({
  type: z.enum(['whatsapp', 'instagram', 'facebook', 'web']),
  name: z.string().min(1),
  accessToken: z.string(),
  phoneNumberId: z.string().optional(),
  pageId: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const registerSchema = loginSchema.extend({
  name: z.string().min(2),
  organizationName: z.string().min(2),
});
```

```typescript
// apps/api/src/utils/encryption.ts
import crypto from 'crypto';

export class EncryptionService {
  private algorithm = 'aes-256-gcm';
  private key: Buffer;
  private tagLength = 16;

  constructor(encryptionKey: string) {
    this.key = crypto
      .createHash('sha256')
      .update(encryptionKey)
      .digest();
  }

  encrypt(text: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  }

  decrypt(encryptedData: string): string {
    const parts = encryptedData.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];

    const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }
}
```

```typescript
// apps/api/src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    organizationId: string;
  };
}

export const auth = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Token no proporcionado',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    req.user = decoded as any;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: 'Token inválido',
    });
  }
};
```

---

## 📊 Ejemplo de Implementación Completa

```typescript
// apps/api/src/index.ts
import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';

import messageRoutes from './routes/messages';
import conversationRoutes from './routes/conversations';
import channelRoutes from './routes/channels';
import aiRoutes from './routes/ai';
import webhookRoutes from './routes/webhooks';

import { auth } from './middleware/auth';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.WEB_URL || 'http://localhost:3000',
    credentials: true,
  },
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Routes
app.use('/api/messages', auth, messageRoutes);
app.use('/api/conversations', auth, conversationRoutes);
app.use('/api/channels', auth, channelRoutes);
app.use('/api/ai', auth, aiRoutes);
app.use('/api/webhooks', webhookRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Socket.io
io.on('connection', (socket) => {
  console.log('Cliente conectado:', socket.id);

  socket.on('join:conversation', (conversationId) => {
    socket.join(`conversation:${conversationId}`);
    socket.emit('notification', {
      type: 'joined',
      conversationId,
    });
  });

  socket.on('leave:conversation', (conversationId) => {
    socket.leave(`conversation:${conversationId}`);
  });

  socket.on('typing', (data) => {
    io.to(`conversation:${data.conversationId}`).emit('user:typing', {
      userId: socket.id,
      conversationId: data.conversationId,
    });
  });

  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
  });
});

// Error handler
app.use(errorHandler);

const PORT = process.env.API_PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 API corriendo en puerto ${PORT}`);
});

export default { app, io };
```

---

## ✅ Checklist de Validación

- [ ] Tipos TypeScript compilar sin errores
- [ ] Rutas API devolver respuestas correctas
- [ ] Componentes React renderizar sin warnings
- [ ] WebSocket conectar y recibir eventos
- [ ] Integración Meta procesar webhooks
- [ ] Claude API generar sugerencias
- [ ] Base de datos ejecutar migraciones
- [ ] Tests e2e pasar todas las pruebas
- [ ] Deployment en Railway exitoso
