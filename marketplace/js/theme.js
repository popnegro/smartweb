(() => {
  'use strict';

  const CSS_VAR_MAP = {
    primary: '--app-primary',
    primaryHover: '--app-primary-hover',
    secondary: '--app-secondary',
    accent: '--app-accent'
  };

  /**
   * Gestor de temas: aplica colores de marca mediante CSS variables.
   */
  class ThemeManager {
    applyTheme(theme = {}) {
      const root = document.documentElement;
      Object.entries(CSS_VAR_MAP).forEach(([key, cssVar]) => {
        if (theme[key]) root.style.setProperty(cssVar, theme[key]);
      });
    }

    updateTheme(partialTheme = {}) {
      const state = stateManager.getState();
      const currentTheme = state.brand?.theme || {};
      const newTheme = { ...currentTheme, ...partialTheme };

      // Si solo se definió 'primary', derivamos un hover más oscuro automáticamente
      if (partialTheme.primary && !partialTheme.primaryHover) {
        newTheme.primaryHover = this.darken(partialTheme.primary, 12);
      }

      this.applyTheme(newTheme);
      return newTheme;
    }

    getPrimaryColor() {
      return getComputedStyle(document.documentElement).getPropertyValue('--app-primary').trim();
    }

    getSecondaryColor() {
      return getComputedStyle(document.documentElement).getPropertyValue('--app-secondary').trim();
    }

    resetTheme() {
      this.applyTheme(ELECTROFIX.DEFAULT_BRAND.theme);
      return ELECTROFIX.DEFAULT_BRAND.theme;
    }

    darken(hex, percent) {
      try {
        const num = parseInt(hex.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const r = Math.max(0, (num >> 16) - amt);
        const g = Math.max(0, ((num >> 8) & 0x00ff) - amt);
        const b = Math.max(0, (num & 0x0000ff) - amt);
        return `#${(0x1000000 + r * 0x10000 + g * 0x100 + b).toString(16).slice(1)}`;
      } catch (error) {
        return hex;
      }
    }
  }

  window.themeManager = new ThemeManager();

  // Aplicar el tema guardado apenas carga el DOM
  document.addEventListener('DOMContentLoaded', () => {
    const brand = stateManager.getState().brand;
    if (brand?.theme) themeManager.applyTheme(brand.theme);
  });
})();
