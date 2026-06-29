/* ══════════════════════════════════════════════
   map-app.js
═══════════════════════════════════════════════ */
(function(){
  'use strict';

  // ── State ──
  const state = {
    screens: [],
    quote: new Set(), // We only need to know the IDs of screens in the quote
  };

  // ── Helpers ──
  const $ = id => document.getElementById(id);
  const fmt = n => '$' + Math.round(n).toLocaleString('es-AR');
  const fmtImp = n => n >= 1000 ? (n/1000).toFixed(1)+'k' : String(n);
  const esc = s => String(s??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  const badgeClass = {Peatonal:'bd-p',Vehicular:'bd-v',Mixto:'bd-m'};
  const dotClass = {Peatonal:'#0369a1',Vehicular:'#0f766e',Mixto:'#7c3aed'};
  function toast(msg, duration=1800){
    const t=document.createElement('div'); t.className='toast'; t.textContent=msg; document.body.appendChild(t);
    setTimeout(()=>t.classList.add('show'),10); setTimeout(()=>{t.classList.remove('show');setTimeout(()=>t.remove(),200)},duration);
  }

  // ── Boot ──
  function boot(){
    // Data from inventory-data.js is already in the correct format.
    const inventoryScreens = window.SCREENS || [];

    // Filter for active screens
    state.screens = inventoryScreens.filter(s => s.status === 'Activo');

    // Load quote from localStorage
    state.quote = new Set(JSON.parse(localStorage.getItem('smartkit_quote') || '[]'));

    applyConfig();
    initMap();
  }

  function applyConfig(){
    const c=window.CONFIG||{};
    ['brand-logo','brand-name'].forEach(id=>{const el=$(id); if(el) el.textContent=id.includes('logo')?c.logo:c.brand;});
  }

  // ── Map ──
  function initMap(){
    if(!window.L) return;
    const mapEl=$('map'); if(!mapEl) return;
    const center=[-32.903,-68.839];
    const lMap=L.map('map').setView(center,12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
      attribution:'© OpenStreetMap contributors',maxZoom:19,
    }).addTo(lMap);
    state.screens.forEach(s=>{
      if(!s.lat||!s.lng) return;
      const m=L.circleMarker([s.lat,s.lng],{radius:9,fillColor:dotClass[s.tipo]||'#64748b',color:'#fff',weight:2,fillOpacity:.9}).addTo(lMap);
      m.on('click',()=>showPanel(s));
    });
    $('scp-close')?.addEventListener('click',()=>$('sc-panel').classList.remove('open'));
  }

  function showPanel(s){
    const panel=$('sc-panel'); if(!panel) return;
    const inQ = state.quote.has(s.id);
    $('scp-content').innerHTML=`
      <div class="scp-hero">${s.video?`<video src="${esc(s.video)}" autoplay muted loop playsinline></video>`:esc((s.nombre||'').substring(0,2).toUpperCase())}</div>
      <strong>${esc(s.nombre)}</strong>
      <p class="mu sm">${esc(s.zona)} · <span class="badge ${badgeClass[s.tipo]||''}">${esc(s.tipo)}</span></p>
      <div class="scp-stats">
        <div class="scp-stat"><span>Impactos/día</span><strong>${fmtImp(s.impactos)}</strong></div>
        <div class="scp-stat"><span>Precio/semana</span><strong>${fmt(s.precio)}</strong></div>
      </div>
      ${s.nota?`<p class="mu sm" style="margin-bottom:10px">${esc(s.nota)}</p>`:''}
      <button class="btn-add${inQ?' on':''}" data-id="${esc(s.id)}">${inQ?'✓ En cotizador':'Añadir al cotizador'}</button>`;
    panel.classList.add('open');

    panel.querySelector('.btn-add')?.addEventListener('click', function() {
      toggleQuote(this.dataset.id);
    });
  }

  function toggleQuote(id) {
    const screen = state.screens.find(s => s.id === id);
    if (!screen) return;
    state.quote.has(id) ? state.quote.delete(id) : state.quote.add(id);
    localStorage.setItem('smartkit_quote', JSON.stringify([...state.quote]));
    showPanel(screen); // Re-render panel to update button state
    toast(state.quote.has(id) ? `${screen.nombre} agregada` : `${screen.nombre} quitada`);
  }

  // ── Init ──
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',boot):boot();
})();