(() => {
  'use strict';

  /**
   * Configuración global de ElectroFix Store
   * Centraliza claves de storage, valores por defecto y reglas de negocio.
   */
  window.ELECTROFIX = {
    // Vacío = modo localStorage. Poné una URL para conectar con un backend real.
    API_BASE_URL: '',

    STORAGE_KEYS: {
      BRAND: 'electrofix_brand',
      ORDERS: 'electrofix_orders',
      QUOTE_REQUESTS: 'electrofix_quote_requests',
      SESSION: 'electrofix_session'
    },

    // ⚠️ Cambiar antes de producción
    ADMIN_ACCESS_KEY: 'admin1234',

    SESSION_DURATION_MS: 24 * 60 * 60 * 1000, // 24 horas

    ORDER_STATES: {
      PENDING: 'pending',
      CONFIRMED: 'confirmed',
      DELIVERED: 'delivered',
      CANCELLED: 'cancelled'
    },

    PAYMENT_METHODS: [
      { id: 'cash', label: 'Efectivo' },
      { id: 'transfer', label: 'Transferencia bancaria' },
      { id: 'card', label: 'Tarjeta de crédito/débito' },
      { id: 'mercadopago', label: 'MercadoPago' }
    ],

    VALIDATION: {
      NAME_MIN_LENGTH: 3,
      PHONE_MIN_DIGITS: 8,
      QUANTITY_MIN: 1,
      QUANTITY_MAX: 999
    },

    DEFAULT_BRAND: {
      identity: {
        name: 'ElectroFix Store',
        whatsapp: '+54 9 261 000 0000'
      },
      theme: {
        primary: '#0f766e',
        primaryHover: '#115e59',
        secondary: '#111827',
        accent: '#f59e0b'
      },
      hero: {
        title: 'Reparación y venta de electrónica para tu negocio',
        description: 'Diagnóstico rápido, repuestos originales y garantía técnica en cada trabajo.',
        image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1600&q=80'
      },
      features: {
        title: 'Todo lo que tu comercio necesita',
        description: 'Servicio técnico especializado, con foco en tiempos de entrega y garantía real.',
        items: [
          { icon: '🔧', title: 'Reparación express', desc: 'Diagnóstico en 24hs y arreglo en el día para fallas comunes.' },
          { icon: '🛡️', title: 'Garantía técnica', desc: '90 días de garantía en repuestos y mano de obra.' },
          { icon: '📦', title: 'Venta mayorista', desc: 'Precios especiales para comercios y revendedores.' }
        ]
      },
      catalog: {
        title: 'Catálogo de productos',
        description: 'Repuestos, accesorios y equipos reacondicionados listos para vender o instalar.',
        products: []
      },
      navigation: [
        { label: 'Servicios', href: '#services' },
        { label: 'Catálogo', href: '#catalog' },
        { label: 'Cotizar', href: '#quote-form' }
      ]
    }
  };
})();
