(() => {
  'use strict';

  /**
   * Flujo de compra en 3 pasos: cantidad -> datos del cliente -> pago.
   * Al confirmar, guarda la orden en el estado y abre WhatsApp con el mensaje pre-armado.
   */
  class CheckoutFlow {
    constructor() {
      this.step = 1;
      this.product = null;
      this.data = { quantity: 1, name: '', phone: '', email: '', paymentMethod: '' };
    }

    startCheckout(product) {
      this.product = product;
      this.step = 1;
      this.data = {
        quantity: 1,
        name: '',
        phone: '',
        email: '',
        paymentMethod: ELECTROFIX.PAYMENT_METHODS[0]?.id || ''
      };
      this.render();
      uiManager.openModal('checkout-modal');
    }

    nextStep() {
      if (!this.validateStep(this.step)) return;

      if (this.step < 3) {
        this.step += 1;
        this.render();
      } else {
        this.completeCheckout();
      }
    }

    previousStep() {
      if (this.step > 1) {
        this.step -= 1;
        this.render();
      }
    }

    cancelCheckout() {
      uiManager.closeModal('checkout-modal');
      this.product = null;
      this.step = 1;
    }

    validateStep(step) {
      this.readFormValues();

      if (step === 1 && !Utils.isValidQuantity(this.data.quantity)) {
        uiManager.showToast('Indica una cantidad válida', 'Error', 'error');
        return false;
      }

      if (step === 2) {
        if (!Utils.isValidName(this.data.name)) {
          uiManager.showToast('Indica un nombre válido', 'Error', 'error');
          return false;
        }
        if (!Utils.isValidPhone(this.data.phone)) {
          uiManager.showToast('Indica un WhatsApp válido', 'Error', 'error');
          return false;
        }
      }

      if (step === 3 && !this.data.paymentMethod) {
        uiManager.showToast('Selecciona un método de pago', 'Error', 'error');
        return false;
      }

      return true;
    }

    readFormValues() {
      const qtyEl = document.getElementById('checkout-quantity');
      const nameEl = document.getElementById('checkout-name');
      const phoneEl = document.getElementById('checkout-phone');
      const emailEl = document.getElementById('checkout-email');
      const paymentEl = document.querySelector('input[name="checkout-payment"]:checked');

      if (qtyEl) this.data.quantity = Number(qtyEl.value) || this.data.quantity;
      if (nameEl) this.data.name = nameEl.value.trim();
      if (phoneEl) this.data.phone = phoneEl.value.trim();
      if (emailEl) this.data.email = emailEl.value.trim();
      if (paymentEl) this.data.paymentMethod = paymentEl.value;
    }

    completeCheckout() {
      const order = stateManager.saveOrder({
        productSku: this.product.sku || this.product.name,
        productName: this.product.name,
        quantity: this.data.quantity,
        customer: {
          name: this.data.name,
          phone: this.data.phone,
          email: this.data.email
        },
        paymentMethod: this.paymentLabel(this.data.paymentMethod)
      });

      this.openWhatsApp(order);
      uiManager.closeModal('checkout-modal');
      uiManager.showToast('Pedido registrado. Te contactaremos por WhatsApp.', 'Éxito', 'success');

      this.product = null;
      this.step = 1;
    }

    paymentLabel(id) {
      const method = ELECTROFIX.PAYMENT_METHODS.find(m => m.id === id);
      return method ? method.label : id;
    }

    openWhatsApp(order) {
      const brand = stateManager.getState().brand;
      const phone = String(brand.identity?.whatsapp || '').replace(/\D/g, '');
      const message = [
        'Hola! Quiero confirmar mi pedido:',
        `Producto: ${order.productName}`,
        `Cantidad: ${order.quantity}`,
        `Pago: ${order.paymentMethod}`,
        `Nombre: ${order.customer.name}`
      ].join('\n');

      const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
      window.open(url, '_blank');
    }

    // ---------- Render ----------
    render() {
      const stepsHtml = {
        1: this.renderStepQuantity(),
        2: this.renderStepCustomer(),
        3: this.renderStepPayment()
      };

      uiManager.updateModalContent('checkout-modal', `
        <div class="mb-4 flex items-center gap-2">
          ${[1, 2, 3].map(n => `
            <div class="h-1.5 flex-1 rounded-full ${n <= this.step ? 'bg-[var(--app-primary)]' : 'bg-slate-200'}"></div>
          `).join('')}
        </div>
        <p class="mb-4 text-sm font-bold text-slate-500">Paso ${this.step} de 3</p>
        ${stepsHtml[this.step]}
        <div class="mt-6 flex gap-3">
          ${this.step > 1 ? '<button type="button" data-checkout-prev class="flex-1 rounded-xl border border-slate-200 py-3 font-bold text-slate-600">Atrás</button>' : ''}
          <button type="button" data-checkout-next class="flex-1 rounded-xl bg-[var(--app-primary)] py-3 font-bold text-white">
            ${this.step === 3 ? 'Confirmar pedido' : 'Continuar'}
          </button>
        </div>
      `);

      const modal = document.getElementById('checkout-modal');
      const nextBtn = modal.querySelector('[data-checkout-next]');
      const prevBtn = modal.querySelector('[data-checkout-prev]');

      if (nextBtn) nextBtn.addEventListener('click', () => this.nextStep());
      if (prevBtn) prevBtn.addEventListener('click', () => this.previousStep());
    }

    renderStepQuantity() {
      return `
        <p class="mb-1 text-lg font-bold text-slate-900">${this.product.name}</p>
        <p class="mb-4 text-sm text-slate-500">${this.product.priceLabel || 'Consultar'}</p>
        <label class="mb-2 block text-sm font-semibold text-slate-700">Cantidad</label>
        <input id="checkout-quantity" type="number" min="1" value="${this.data.quantity}" class="w-full rounded-xl border border-slate-200 bg-slate-50 p-3">
      `;
    }

    renderStepCustomer() {
      return `
        <label class="mb-2 block text-sm font-semibold text-slate-700">Nombre</label>
        <input id="checkout-name" type="text" value="${this.data.name}" class="mb-4 w-full rounded-xl border border-slate-200 bg-slate-50 p-3">
        <label class="mb-2 block text-sm font-semibold text-slate-700">WhatsApp</label>
        <input id="checkout-phone" type="tel" value="${this.data.phone}" placeholder="+54 9 ..." class="mb-4 w-full rounded-xl border border-slate-200 bg-slate-50 p-3">
        <label class="mb-2 block text-sm font-semibold text-slate-700">Email (opcional)</label>
        <input id="checkout-email" type="email" value="${this.data.email}" class="w-full rounded-xl border border-slate-200 bg-slate-50 p-3">
      `;
    }

    renderStepPayment() {
      return `
        <p class="mb-3 text-sm font-semibold text-slate-700">Método de pago</p>
        <div class="space-y-2">
          ${ELECTROFIX.PAYMENT_METHODS.map(method => `
            <label class="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-3">
              <input type="radio" name="checkout-payment" value="${method.id}" ${this.data.paymentMethod === method.id ? 'checked' : ''}>
              <span class="text-sm font-semibold text-slate-700">${method.label}</span>
            </label>
          `).join('')}
        </div>
        <div class="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
          <p><strong>${this.product.name}</strong> × ${this.data.quantity}</p>
          <p class="mt-1">${this.data.name} · ${this.data.phone}</p>
        </div>
      `;
    }
  }

  window.checkoutFlow = new CheckoutFlow();
})();
