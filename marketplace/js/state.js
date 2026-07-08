(() => {
  'use strict';

  const KEYS = ELECTROFIX.STORAGE_KEYS;

  /**
   * Gestor de estado reactivo (Observer Pattern).
   * Único punto de verdad para brand, orders, quoteRequests y sesión de admin.
   */
  class StateManager {
    constructor() {
      this.listeners = [];
      this.history = [];
      this.state = this.loadInitialState();
    }

    loadInitialState() {
      return {
        user: this.loadSession(),
        brand: this.loadBrand(),
        orders: this.loadJson(KEYS.ORDERS, []),
        quoteRequests: this.loadJson(KEYS.QUOTE_REQUESTS, [])
      };
    }

    loadJson(key, fallback) {
      try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
      } catch (error) {
        console.error(`No se pudo leer ${key} de localStorage:`, error);
        return fallback;
      }
    }

    saveJson(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch (error) {
        console.error(`No se pudo guardar ${key} en localStorage:`, error);
        return false;
      }
    }

    loadBrand() {
      const stored = this.loadJson(KEYS.BRAND, null);
      return stored
        ? Utils.deepMerge(ELECTROFIX.DEFAULT_BRAND, stored)
        : Utils.deepMerge({}, ELECTROFIX.DEFAULT_BRAND);
    }

    loadSession() {
      const session = this.loadJson(KEYS.SESSION, null);
      if (!session || !session.authenticated) return { authenticated: false };
      if (session.expiresAt && Date.now() > session.expiresAt) {
        localStorage.removeItem(KEYS.SESSION);
        return { authenticated: false };
      }
      return session;
    }

    // ---------- Estado ----------
    getState() {
      return { ...this.state };
    }

    setState(updates) {
      this.state = { ...this.state, ...updates };
      this.recordHistory(updates);
      this.notify();
      return this.getState();
    }

    subscribe(callback) {
      this.listeners.push(callback);
      return () => {
        this.listeners = this.listeners.filter(fn => fn !== callback);
      };
    }

    notify() {
      this.listeners.forEach(callback => {
        try {
          callback(this.getState());
        } catch (error) {
          console.error('Error en listener de stateManager:', error);
        }
      });
    }

    recordHistory(updates) {
      this.history.push({ updates, timestamp: Date.now() });
      if (this.history.length > 50) this.history.shift();
    }

    getHistory(limit = 20) {
      return this.history.slice(-limit);
    }

    // ---------- Sesión admin ----------
    createSession(session) {
      const fullSession = {
        ...session,
        expiresAt: Date.now() + ELECTROFIX.SESSION_DURATION_MS
      };
      this.saveJson(KEYS.SESSION, fullSession);
      this.setState({ user: fullSession });
      return fullSession;
    }

    clearSession() {
      localStorage.removeItem(KEYS.SESSION);
      this.setState({ user: { authenticated: false } });
    }

    // ---------- Marca ----------
    updateBrand(brand) {
      return this.saveBrand(brand);
    }

    saveBrand(brand) {
      this.saveJson(KEYS.BRAND, brand);
      this.setState({ brand });
      return brand;
    }

    // ---------- Pedidos ----------
    saveOrder(order) {
      const newOrder = {
        id: order.id || `ORD-${Date.now()}`,
        status: order.status || ELECTROFIX.ORDER_STATES.PENDING,
        createdAt: order.createdAt || new Date().toISOString(),
        ...order
      };
      const orders = [newOrder, ...this.state.orders];
      this.saveJson(KEYS.ORDERS, orders);
      this.setState({ orders });
      return newOrder;
    }

    // ---------- Cotizaciones ----------
    saveQuoteRequest(quote) {
      const newQuote = {
        id: quote.id || `QUO-${Date.now()}`,
        createdAt: quote.createdAt || new Date().toISOString(),
        ...quote
      };
      const quoteRequests = [newQuote, ...this.state.quoteRequests];
      this.saveJson(KEYS.QUOTE_REQUESTS, quoteRequests);
      this.setState({ quoteRequests });
      return newQuote;
    }

    // ---------- Reset (solo desarrollo) ----------
    reset() {
      Object.values(KEYS).forEach(key => localStorage.removeItem(key));
      this.state = this.loadInitialState();
      this.notify();
    }
  }

  window.stateManager = new StateManager();
})();
