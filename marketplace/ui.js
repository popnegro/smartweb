(() => {
  'use strict';

  /**
   * Gestor de UI: modales, notificaciones (toast) y validación de formularios.
   */
  class UIManager {
    constructor() {
      this.modals = {};
      this.ensureToastContainer();
    }

    ensureToastContainer() {
      if (!document.getElementById('toast-container')) {
        const container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'fixed top-4 right-4 z-[200] flex flex-col gap-2';
        document.body.appendChild(container);
      }
    }

    // ---------- Modales ----------
    createModal(id, options = {}) {
      let modal = document.getElementById(id);
      if (!modal) {
        modal = document.createElement('div');
        modal.id = id;
        document.body.appendChild(modal);
      }

      const maxWidths = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg', xl: 'max-w-xl' };
      const maxWidthClass = maxWidths[options.maxWidth] || maxWidths.md;

      modal.className = 'fixed inset-0 z-[90] hidden place-items-center bg-slate-950/60 p-4';
      modal.innerHTML = `
        <div class="w-full ${maxWidthClass} rounded-2xl bg-white p-6 shadow-2xl">
          <div class="mb-4 flex items-center justify-between">
            <h3 class="text-lg font-bold text-slate-900" data-modal-title>${options.title || ''}</h3>
            <button type="button" data-modal-close class="text-2xl leading-none text-slate-400 transition hover:text-slate-700">&times;</button>
          </div>
          <div data-modal-body>${options.content || ''}</div>
        </div>
      `;

      modal.querySelector('[data-modal-close]').addEventListener('click', () => this.closeModal(id));
      modal.addEventListener('click', (event) => {
        if (event.target === modal) this.closeModal(id);
      });

      this.modals[id] = modal;
      return modal;
    }

    openModal(id) {
      const modal = this.modals[id] || document.getElementById(id);
      if (!modal) return;
      modal.classList.remove('hidden');
      modal.classList.add('grid');
    }

    closeModal(id) {
      const modal = this.modals[id] || document.getElementById(id);
      if (!modal) return;
      modal.classList.add('hidden');
      modal.classList.remove('grid');
    }

    updateModalContent(id, content) {
      const modal = this.modals[id] || document.getElementById(id);
      if (!modal) return;
      const body = modal.querySelector('[data-modal-body]');
      if (body) body.innerHTML = content;
    }

    // ---------- Toasts ----------
    showToast(message, title = '', type = 'info') {
      this.ensureToastContainer();
      const container = document.getElementById('toast-container');

      const palettes = {
        success: 'bg-emerald-600',
        error: 'bg-red-600',
        warning: 'bg-amber-500',
        info: 'bg-blue-600',
        dark: 'bg-slate-800'
      };
      const bg = palettes[type] || palettes.info;

      const toast = document.createElement('div');
      toast.className = `${bg} animate-slide-up min-w-[240px] max-w-sm rounded-xl px-4 py-3 text-white shadow-lg`;
      toast.innerHTML = `
        ${title ? `<p class="text-sm font-bold">${title}</p>` : ''}
        <p class="text-sm ${title ? 'mt-1 text-white/90' : ''}">${message}</p>
      `;

      container.appendChild(toast);

      setTimeout(() => {
        toast.style.transition = 'opacity 0.3s ease';
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
      }, 3200);
    }

    // ---------- Validación de formularios ----------
    setFieldError(fieldId, message) {
      const field = document.getElementById(fieldId);
      const errorEl = document.querySelector(`[data-error-for="${fieldId}"]`);

      if (field) field.classList.add('field-error');

      if (errorEl) {
        errorEl.textContent = message;
        errorEl.classList.remove('hidden');
      } else {
        this.showToast(message, 'Error', 'error');
      }
    }

    clearFieldErrors(formId) {
      const form = document.getElementById(formId);
      if (!form) return;
      Utils.$$('.field-error', form).forEach(el => el.classList.remove('field-error'));
      Utils.$$('[data-error-for]', form).forEach(el => {
        el.textContent = '';
        el.classList.add('hidden');
      });
    }

    // ---------- Loading en botones ----------
    setButtonLoading(btnId, isLoading) {
      const btn = document.getElementById(btnId);
      if (!btn) return;

      if (isLoading) {
        btn.dataset.originalText = btn.textContent;
        btn.disabled = true;
        btn.textContent = 'Procesando...';
      } else {
        btn.disabled = false;
        btn.textContent = btn.dataset.originalText || btn.textContent;
      }
    }
  }

  window.uiManager = new UIManager();
})();
