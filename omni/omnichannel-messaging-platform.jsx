import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, Settings, BarChart3, Bot, Search, Menu, X, CheckCircle, Clock, AlertCircle, TrendingUp, Users, MessageCircle } from 'lucide-react';

export default function OmnichanelMessagingPlatform() {
  const [activeChat, setActiveChat] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [selectedChannel, setSelectedChannel] = useState('all');
  const [aiSuggestions, setAiSuggestions] = useState([]);

  // Mock conversations data
  const conversations = [
    { id: 1, name: 'Cliente Ecommerce', channel: 'whatsapp', avatar: '👤', unread: 3, lastMsg: 'Hola, consulta sobre mi pedido', time: '2m', sentiment: 'neutral' },
    { id: 2, name: 'Soporte Técnico', channel: 'instagram', avatar: '📱', unread: 0, lastMsg: 'Problema resuelto exitosamente', time: '1h', sentiment: 'positive' },
    { id: 3, name: 'Seguimiento Venta', channel: 'facebook', avatar: '🏢', unread: 1, lastMsg: 'Interesado en promoción', time: '30m', sentiment: 'positive' },
    { id: 4, name: 'Consulta General', channel: 'web', avatar: '🌐', unread: 0, lastMsg: 'Gracias por tu ayuda', time: '3h', sentiment: 'positive' },
    { id: 5, name: 'Reclamo Pendiente', channel: 'whatsapp', avatar: '⚠️', unread: 2, lastMsg: 'Esperando respuesta', time: '15m', sentiment: 'negative' },
  ];

  const channelConfig = {
    whatsapp: { icon: '💬', color: 'bg-green-500', label: 'WhatsApp' },
    instagram: { icon: '📷', color: 'bg-pink-500', label: 'Instagram' },
    facebook: { icon: '👍', color: 'bg-blue-600', label: 'Facebook' },
    web: { icon: '🌐', color: 'bg-purple-500', label: 'Web Chat' },
  };

  const metrics = [
    { label: 'Mensajes Hoy', value: '2,847', change: '+12%', icon: MessageCircle },
    { label: 'Tasa Respuesta', value: '94%', change: '+2%', icon: CheckCircle },
    { label: 'Tiempo Promedio', value: '2m 34s', change: '-18%', icon: Clock },
    { label: 'Satisfacción IA', value: '87%', change: '+5%', icon: Bot },
  ];

  // Simular carga de sugerencias IA
  useEffect(() => {
    if (activeChat >= 0) {
      setAiSuggestions([
        { id: 1, text: '¿Cuál es el estado de tu pedido? Puedo ayudarte a rastrearlo.', confidence: 92 },
        { id: 2, text: 'Parece una consulta sobre envío. ¿Necesitas información de tracking?', confidence: 85 },
        { id: 3, text: 'Ofrecer descuento del 10% en próxima compra como compensación.', confidence: 78 },
      ]);
    }
  }, [activeChat]);

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      setMessages([...messages, { text: inputValue, sender: 'user', timestamp: new Date() }]);
      setInputValue('');
      
      // Simular respuesta IA
      setTimeout(() => {
        setMessages(prev => [...prev, { 
          text: 'Mensaje procesado por IA. Analizando contexto...', 
          sender: 'assistant', 
          timestamp: new Date(),
          aiGenerated: true 
        }]);
      }, 500);
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white font-['Geist']">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-80' : 'w-0'} bg-gradient-to-b from-slate-900 to-slate-950 border-r border-slate-800 transition-all duration-300 overflow-hidden flex flex-col`}>
        {/* Header Sidebar */}
        <div className="p-6 border-b border-slate-800 bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-padding">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-lg">Omnichannel AI</h1>
              <p className="text-xs opacity-80">Unified Messaging Platform</p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Buscar conversación..." 
              className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30"
            />
          </div>
        </div>

        {/* Channel Filter */}
        <div className="px-4 pb-4 flex gap-2 overflow-x-auto">
          {['all', 'whatsapp', 'instagram', 'facebook', 'web'].map(ch => (
            <button
              key={ch}
              onClick={() => setSelectedChannel(ch)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                selectedChannel === ch 
                  ? 'bg-cyan-600 text-white' 
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              {ch === 'all' ? 'Todos' : channelConfig[ch].label}
            </button>
          ))}
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto px-3 space-y-2">
          {conversations.map((conv, idx) => (
            <button
              key={conv.id}
              onClick={() => setActiveChat(idx)}
              className={`w-full p-3 rounded-lg transition group ${
                activeChat === idx
                  ? 'bg-gradient-to-r from-cyan-600/30 to-blue-600/20 border-l-2 border-cyan-500'
                  : 'hover:bg-slate-800'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="text-2xl flex-shrink-0">{conv.avatar}</div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-sm truncate">{conv.name}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${channelConfig[conv.channel].color} text-white`}>
                      {channelConfig[conv.channel].icon}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 truncate mt-1">{conv.lastMsg}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-slate-500">{conv.time}</span>
                    {conv.unread > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                        {conv.unread}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-slate-800 space-y-2">
          <button className="w-full py-2 px-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-lg font-medium text-sm transition">
            + Nueva Conversación
          </button>
          <button className="w-full py-2 px-4 bg-slate-800 hover:bg-slate-700 rounded-lg font-medium text-sm transition flex items-center justify-center gap-2">
            <Settings className="w-4 h-4" />
            Configuración
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 hover:bg-slate-800 rounded-lg"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            
            {activeTab === 'chat' && (
              <div className="flex items-center gap-3">
                <div className="text-3xl">{conversations[activeChat]?.avatar}</div>
                <div>
                  <h2 className="font-bold text-lg">{conversations[activeChat]?.name}</h2>
                  <p className="text-xs text-slate-400 flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    En línea en {channelConfig[conversations[activeChat]?.channel].label}
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'dashboard' && (
              <h2 className="font-bold text-xl">Dashboard de Inteligencia</h2>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button className="p-2 hover:bg-slate-800 rounded-lg transition">
              <BarChart3 className="w-5 h-5" />
            </button>
            <button className="p-2 hover:bg-slate-800 rounded-lg transition">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden">
          {/* Dashboard View */}
          {activeTab === 'dashboard' && (
            <div className="overflow-y-auto h-full p-6 space-y-6">
              {/* KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {metrics.map((metric, idx) => {
                  const Icon = metric.icon;
                  return (
                    <div key={idx} className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-lg p-4 hover:border-cyan-500/30 transition group">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <p className="text-slate-400 text-sm font-medium">{metric.label}</p>
                          <p className="text-3xl font-bold mt-2">{metric.value}</p>
                        </div>
                        <div className="p-2 bg-cyan-600/20 rounded-lg group-hover:bg-cyan-600/30 transition">
                          <Icon className="w-5 h-5 text-cyan-400" />
                        </div>
                      </div>
                      <p className="text-green-400 text-xs font-semibold flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        {metric.change}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Analytics Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Channel Distribution */}
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-lg p-6">
                  <h3 className="font-bold text-lg mb-4">Distribución por Canal</h3>
                  <div className="space-y-4">
                    {[
                      { name: 'WhatsApp', value: 45, color: 'bg-green-500' },
                      { name: 'Instagram', value: 28, color: 'bg-pink-500' },
                      { name: 'Facebook', value: 18, color: 'bg-blue-600' },
                      { name: 'Web Chat', value: 9, color: 'bg-purple-500' },
                    ].map((ch, idx) => (
                      <div key={idx}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">{ch.name}</span>
                          <span className="text-xs text-slate-400">{ch.value}%</span>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                          <div className={`h-full ${ch.color} rounded-full`} style={{ width: `${ch.value}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Insights */}
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-lg p-6">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <Bot className="w-5 h-5 text-cyan-400" />
                    Insights de IA
                  </h3>
                  <div className="space-y-3">
                    <div className="p-3 bg-slate-700/50 rounded-lg border-l-2 border-cyan-500">
                      <p className="text-sm"><span className="font-semibold text-cyan-400">Sentiment Positivo:</span> 73% de mensajes today</p>
                    </div>
                    <div className="p-3 bg-slate-700/50 rounded-lg border-l-2 border-green-500">
                      <p className="text-sm"><span className="font-semibold text-green-400">Auto-respuestas:</span> Respondió 156 consultas</p>
                    </div>
                    <div className="p-3 bg-slate-700/50 rounded-lg border-l-2 border-orange-500">
                      <p className="text-sm"><span className="font-semibold text-orange-400">Escalaciones:</span> 12 casos para revisión manual</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Architecture Info */}
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-lg p-6">
                <h3 className="font-bold text-lg mb-4">Tecnología de la Plataforma</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-cyan-400 font-semibold mb-2">Backend</p>
                    <ul className="text-slate-400 space-y-1 text-xs">
                      <li>• Node.js + Express</li>
                      <li>• TypeScript</li>
                      <li>• PostgreSQL + Prisma</li>
                      <li>• WebSockets (Socket.io)</li>
                      <li>• Bull Queues</li>
                    </ul>
                  </div>
                  <div>
                    <p className="text-cyan-400 font-semibold mb-2">Frontend</p>
                    <ul className="text-slate-400 space-y-1 text-xs">
                      <li>• Next.js 14 (App Router)</li>
                      <li>• React + TypeScript</li>
                      <li>• Tailwind CSS</li>
                      <li>• Real-time UI</li>
                      <li>• Responsive Design</li>
                    </ul>
                  </div>
                  <div>
                    <p className="text-cyan-400 font-semibold mb-2">Integraciones</p>
                    <ul className="text-slate-400 space-y-1 text-xs">
                      <li>• Meta Business Platform</li>
                      <li>• Claude API (IA)</li>
                      <li>• Webhook Management</li>
                      <li>• Rate Limiting</li>
                      <li>• Error Tracking</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Chat View */}
          {activeTab !== 'dashboard' && (
            <div className="flex flex-col h-full">
              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 scroll-smooth">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-500">
                    <MessageSquare className="w-12 h-12 mb-3 opacity-30" />
                    <p>Inicia la conversación</p>
                  </div>
                ) : (
                  messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                        msg.sender === 'user'
                          ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-br-none'
                          : 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700'
                      } ${msg.aiGenerated ? 'border-l-2 border-cyan-500' : ''}`}>
                        <p className="text-sm">{msg.text}</p>
                        <p className="text-xs opacity-60 mt-1">{msg.timestamp.toLocaleTimeString()}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* AI Suggestions */}
              {aiSuggestions.length > 0 && (
                <div className="px-6 pb-4 space-y-2">
                  <p className="text-xs text-slate-400 font-medium">Sugerencias de IA</p>
                  <div className="space-y-2">
                    {aiSuggestions.map(suggestion => (
                      <button
                        key={suggestion.id}
                        onClick={() => {
                          setInputValue(suggestion.text);
                        }}
                        className="w-full p-2 text-left text-xs bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 rounded-lg transition group"
                      >
                        <p className="text-slate-300 group-hover:text-white transition">{suggestion.text}</p>
                        <p className="text-slate-500 text-xs mt-1">Confianza: {suggestion.confidence}%</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input Area */}
              <div className="border-t border-slate-800 bg-slate-900 p-4">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Escribe tu respuesta..."
                    className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30"
                  />
                  <button
                    onClick={handleSendMessage}
                    className="px-4 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-lg transition flex items-center gap-2 font-medium"
                  >
                    <Send className="w-4 h-4" />
                    <span className="hidden sm:inline">Enviar</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="fixed bottom-6 right-6 flex gap-2 bg-slate-900 border border-slate-800 rounded-lg p-2">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-4 py-2 rounded-lg transition font-medium text-sm ${
            activeTab === 'dashboard'
              ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Dashboard
        </button>
        <button
          onClick={() => setActiveTab('chat')}
          className={`px-4 py-2 rounded-lg transition font-medium text-sm ${
            activeTab === 'chat'
              ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Chat
        </button>
      </div>
    </div>
  );
}
