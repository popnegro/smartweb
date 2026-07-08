(() => {
  'use strict';

  /**
   * Utilidades comunes reutilizables en toda la app.
   */
  window.Utils = {
    // ---------- DOM ----------
    $(selector, scope) {
      return (scope || document).querySelector(selector);
    },

    $$(selector, scope) {
      return Array.from((scope || document).querySelectorAll(selector));
    },

    show(el) {
      if (el) el.classList.remove('hidden');
    },

    hide(el) {
      if (el) el.classList.add('hidden');
    },

    /**
     * Crea un elemento DOM.
     * options: { id, className, text, html, attrs: {}, }
     */
    createElement(tag, options = {}) {
      const el = document.createElement(tag);

      if (options.id) el.id = options.id;
      if (options.className) el.className = options.className;
      if (options.text !== undefined) el.textContent = options.text;
      if (options.html !== undefined) el.innerHTML = options.html;

      if (options.attrs) {
        Object.entries(options.attrs).forEach(([key, value]) => {
          el.setAttribute(key, value);
        });
      }

      return el;
    },

    // ---------- Validación ----------
    isValidEmail(email) {
      if (!email) return false;
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim());
    },

    isValidPhone(phone) {
      if (!phone) return false;
      const digits = String(phone).replace(/\D/g, '');
      return digits.length >= ELECTROFIX.VALIDATION.PHONE_MIN_DIGITS;
    },

    isValidName(name) {
      if (!name) return false;
      return String(name).trim().length >= ELECTROFIX.VALIDATION.NAME_MIN_LENGTH;
    },

    isValidQuantity(qty) {
      const n = Number(qty);
      return Number.isFinite(n) &&
        n >= ELECTROFIX.VALIDATION.QUANTITY_MIN &&
        n <= ELECTROFIX.VALIDATION.QUANTITY_MAX;
    },

    /**
     * Valida un objeto de datos contra un set de reglas.
     * rules: { campo: { required, minLength, validate, message } }
     * Devuelve un objeto { campo: 'mensaje de error' } (vacío si todo OK)
     */
    getValidationErrors(data, rules) {
      const errors = {};

      Object.entries(rules).forEach(([field, rule]) => {
        const value = data[field];

        if (rule.required && (value === undefined || value === null || String(value).trim() === '')) {
          errors[field] = rule.message || `El campo ${field} es requerido`;
          return;
        }

        if (rule.minLength && String(value || '').trim().length < rule.minLength) {
          errors[field] = rule.message || `El campo ${field} es demasiado corto`;
          return;
        }

        if (typeof rule.validate === 'function' && !rule.validate(value)) {
          errors[field] = rule.message || `El campo ${field} no es válido`;
        }
      });

      return errors;
    },

    // ---------- Formato ----------
    formatPrice(amount, currency = 'ARS') {
      const n = Number(amount);
      if (!Number.isFinite(n)) return String(amount);
      try {
        return new Intl.NumberFormat('es-AR', { style: 'currency', currency }).format(n);
      } catch (error) {
        return `$${n.toFixed(2)}`;
      }
    },

    formatDate(date) {
      const d = date instanceof Date ? date : new Date(date);
      if (Number.isNaN(d.getTime())) return '';
      return new Intl.DateTimeFormat('es-AR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      }).format(d);
    },

    escapeCsv(value) {
      const str = value === undefined || value === null ? '' : String(value);
      if (/[",\n]/.test(str)) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    },

    truncate(text, length = 50) {
      const str = String(text || '');
      if (str.length <= length) return str;
      return `${str.slice(0, length - 1)}…`;
    },

    // ---------- Async ----------
    async fetchData(url, options = {}) {
      try {
        const response = await fetch(url, {
          headers: { 'Content-Type': 'application/json' },
          ...options
        });
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        return await response.json();
      } catch (error) {
        console.error('Fetch error:', error);
        throw error;
      }
    },

    async sha256(text) {
      const encoder = new TextEncoder();
      const data = encoder.encode(text);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    },

    // ---------- Objetos ----------
    deepMerge(target, source) {
      const output = { ...target };
      if (isObject(target) && isObject(source)) {
        Object.keys(source).forEach(key => {
          if (isObject(source[key])) {
            output[key] = key in target ? Utils.deepMerge(target[key], source[key]) : source[key];
          } else {
            output[key] = source[key];
          }
        });
      }
      return output;
    },

    pick(obj, keys) {
      const result = {};
      keys.forEach(key => {
        if (key in obj) result[key] = obj[key];
      });
      return result;
    },

    omit(obj, keys) {
      const result = { ...obj };
      keys.forEach(key => delete result[key]);
      return result;
    }
  };

  function isObject(value) {
    return value && typeof value === 'object' && !Array.isArray(value);
  }
})();
