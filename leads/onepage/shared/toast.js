(() => {
  'use strict';

  const { $, createElement } = window.AppUtils;

  function showToast(message, title = 'Notificacion', variant = 'light') {
    const container = $('#toast-container');
    if (!container) return;

    const className = variant === 'dark'
      ? 'pointer-events-auto min-w-[260px] max-w-xs translate-y-4 rounded-xl bg-slate-900 px-5 py-4 text-white opacity-0 shadow-xl transition-all duration-300'
      : 'pointer-events-auto min-w-[280px] max-w-xs translate-y-4 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-slate-800 opacity-0 shadow-2xl transition-all duration-300';

    const toast = createElement('div', { className });
    toast.append(
      createElement('p', { text: title, className: 'text-sm font-black' }),
      createElement('p', {
        text: message,
        className: variant === 'dark' ? 'mt-1 text-xs text-white/70' : 'mt-1 text-xs text-slate-500'
      })
    );

    container.appendChild(toast);
    requestAnimationFrame(() => toast.classList.remove('translate-y-4', 'opacity-0'));
    setTimeout(() => {
      toast.classList.add('opacity-0', '-translate-y-2');
      setTimeout(() => toast.remove(), 300);
    }, variant === 'dark' ? 3500 : 4000);
  }

  window.AppToast = { showToast };
})();
