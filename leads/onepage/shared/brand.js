(() => {
  'use strict';

  const { schemaVersion, storageKeys } = window.APP_CONFIG;

  window.APP_DEFAULT_BRAND = {
    schemaVersion: 2,
    identity: {
      name: 'ElectroFix Store',
      theme: {
        primary: '#0f766e',
        primaryHover: '#115e59',
        secondary: '#111827',
        accent: '#f59e0b'
      }
    },
    navigation: [
      { label: 'Servicios', href: '#services' },
      { label: 'Catalogo', href: '#catalog' },
      { label: 'Cotizar', href: '#quote-form' }
    ],
    hero: {
      title: 'Electronica, accesorios y reparaciones con respuesta rapida.',
      description: 'Una landing orientada a conversion para comercios minoristas: muestra servicios, productos clave y captura solicitudes de cotizacion desde WhatsApp o panel admin.',
      image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1600&q=80',
      imageAlt: 'Mesa de trabajo con notebook y dispositivos electronicos',
      actions: [
        { label: 'Cotizar producto', href: '#quote-form', primary: true },
        { label: 'Ver reparaciones', href: '#services', primary: false }
      ]
    },
    logos: {
      title: 'Trabajamos con equipos y accesorios compatibles con marcas lideres',
      items: [
        { name: 'Samsung' },
        { name: 'Motorola' },
        { name: 'Xiaomi' },
        { name: 'Apple' },
        { name: 'Lenovo' },
        { name: 'HP' },
        { name: 'Asus' },
        { name: 'Epson' }
      ]
    },
    features: {
      title: 'Servicios que resuelven urgencias reales del cliente.',
      description: 'Reparacion tecnica, venta asistida y configuracion para que cada consulta tenga un proximo paso claro.',
      items: [
        { title: 'Reparacion de celulares', desc: 'Cambio de modulo, bateria, pin de carga, parlantes y diagnostico de fallas frecuentes.', icon: '01' },
        { title: 'Notebooks y PC', desc: 'Mantenimiento, cambio de disco, ampliacion de RAM, limpieza interna e instalacion de sistema.', icon: '02' },
        { title: 'Accesorios y configuracion', desc: 'Cargadores, auriculares, protectores, routers, impresoras y puesta en marcha.', icon: '03' }
      ]
    },
    catalog: {
      title: 'Catalogo rapido para cotizar sin friccion.',
      description: 'Productos y servicios frecuentes listos para capturar demanda aunque el stock o precio final cambie por modelo.',
      products: [
        { sku: 'REP-MOD', name: 'Cambio de modulo de celular', category: 'Reparacion', description: 'Cotizacion segun marca/modelo, calidad del repuesto y disponibilidad.', priceLabel: 'Cotizar por modelo', badge: 'Alta demanda' },
        { sku: 'ACC-CHG', name: 'Cargadores y cables rapidos', category: 'Accesorios', description: 'Opciones USB-C, Lightning y micro USB para venta minorista.', priceLabel: 'Desde USD 8', badge: 'Stock variable' },
        { sku: 'PC-SSD', name: 'Upgrade SSD para notebook', category: 'Computacion', description: 'Migracion de datos, instalacion y mejora de rendimiento.', priceLabel: 'Desde USD 45', badge: 'Servicio + producto' },
        { sku: 'AUD-BT', name: 'Auriculares Bluetooth', category: 'Audio', description: 'Modelos compactos para uso diario, llamadas y movilidad.', priceLabel: 'Desde USD 18', badge: 'Popular' },
        { sku: 'NET-WIFI', name: 'Router WiFi hogar/comercio', category: 'Redes', description: 'Venta, configuracion inicial y mejora de cobertura.', priceLabel: 'Consultar', badge: 'Instalacion' },
        { sku: 'PRN-INK', name: 'Tintas e insumos de impresion', category: 'Impresion', description: 'Insumos para impresoras hogarenas y comercios pequenos.', priceLabel: 'Consultar stock', badge: 'Reposicion' }
      ]
    },
    cta: {
      title: 'Responde mas rapido y vende mejor.',
      description: 'Usa esta landing para validar productos, reparaciones y consultas antes de invertir en una tienda online completa.',
      actions: [{ label: 'Solicitar cotizacion', href: '#quote-form' }]
    },
    footer: {
      copy: `© ${new Date().getFullYear()} ElectroFix Store. Todos los derechos reservados.`
    }
  };

  function readBrand() {
    const stored = window.AppUtils.readJson(storageKeys.brand, null);
    const defaults = window.APP_DEFAULT_BRAND;

    if (!stored || stored.schemaVersion !== schemaVersion || stored.identity?.name === 'Guerrero Oftalmologia') {
      window.AppUtils.saveJson(storageKeys.brand, defaults);
      return structuredClone(defaults);
    }
    return stored;
  }

  function normalizeBrand(rawBrand) {
    const defaults = window.APP_DEFAULT_BRAND;
    const brand = rawBrand || defaults;

    return {
      ...defaults,
      ...brand,
      schemaVersion,
      identity: { ...defaults.identity, ...(brand.identity || {}) },
      navigation: brand.navigation || defaults.navigation,
      hero: { ...defaults.hero, ...(brand.hero || {}) },
      logos: { ...defaults.logos, ...(brand.logos || {}) },
      features: {
        ...defaults.features,
        ...(brand.features || {}),
        items: brand.features?.items || defaults.features.items
      },
      catalog: {
        ...defaults.catalog,
        ...(brand.catalog || {}),
        products: brand.catalog?.products || defaults.catalog.products
      },
      cta: { ...defaults.cta, ...(brand.cta || {}) },
      footer: { ...defaults.footer, ...(brand.footer || {}) }
    };
  }

  function applyTheme(brand) {
    const theme = brand.identity?.theme || window.APP_DEFAULT_BRAND.identity.theme;
    const root = document.documentElement.style;
    root.setProperty('--app-primary', theme.primary);
    root.setProperty('--app-primary-hover', theme.primaryHover);
    root.setProperty('--app-secondary', theme.secondary);
    root.setProperty('--app-accent', theme.accent);
  }

  async function persistBrand(brand) {
    const { apiBaseUrl, storageKeys } = window.APP_CONFIG;

    if (apiBaseUrl) {
      const response = await fetch(`${apiBaseUrl}/brand`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(brand)
      });
      if (!response.ok) throw new Error('No se pudo guardar el catalogo.');
      return;
    }

    window.AppUtils.saveJson(storageKeys.brand, brand);
  }

  window.AppBrand = { readBrand, normalizeBrand, applyTheme, persistBrand };
})();
