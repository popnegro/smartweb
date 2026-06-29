/* ══════════════════════════════════════════════
   app.js
═══════════════════════════════════════════════ */
(function(){
  'use strict';

  // ── State ──
  const state = {
    screens: [],
    filtered: [],
    quote: new Map(),
    weeks: 4,
    activeZone: 'Todos',
  };

  // ── Helpers ──
  const $ = id => document.getElementById(id);
  const fmt = n => '$' + Math.round(n).toLocaleString('es-AR');
  const fmtImp = n => n >= 1000 ? (n/1000).toFixed(1)+'k' : String(n);
  const esc = s => String(s??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  const badgeClass = {Peatonal:'bd-p',Vehicular:'bd-v',Mixto:'bd-m'};

  function toast(msg, duration=1800){
    const t=$('toast'); t.textContent=msg; t.classList.add('show');
    setTimeout(()=>t.classList.remove('show'), duration);
  }

  // ── Boot ──
  function boot(){
    // Data from inventory-data.js is already in the correct format.
    const inventoryScreens = window.SCREENS || [];

    // Filter for active screens
    state.screens = inventoryScreens.filter(s => s.status === 'Activo');
    state.filtered=[...state.screens];

    // Load quote from localStorage
    const savedQuoteIds = JSON.parse(localStorage.getItem('smartkit_quote') || '[]');
    savedQuoteIds.forEach(id => {
      const screen = state.screens.find(s => s.id === id);
      if (screen) state.quote.set(id, screen);
    });

    applyConfig();
    renderHeroStats();
    buildZoneFilters();
    renderCards();
    renderQuote();
    setupDuration();
    setupActions();
  }

  function applyConfig(){
    const c=window.CONFIG||{};
    ['brand-logo','brand-name'].forEach(id=>{const el=$(id); if(el) el.textContent=id.includes('logo')?c.logo:c.brand;});
    if(c.heroTitle){ const el=$('hero-title'); if(el) el.textContent=c.heroTitle; }
    if(c.heroCopy){  const el=$('hero-copy');  if(el) el.textContent=c.heroCopy;  }
  }

  function renderHeroStats(){
    const el=$('hero-stats'); if(!el) return;
    const total=state.screens.length;
    const imp=state.screens.reduce((a,s)=>a+(s.impactos||0),0);
    const zones=[...new Set(state.screens.map(s=>s.zona))].length;
    el.innerHTML=`
      <div class="stat"><b>${total}</b><span>Pantallas</span></div>
      <div class="stat"><b>${fmtImp(imp)}</b><span>Impactos/día</span></div>
      <div class="stat"><b>${zones}</b><span>Zonas</span></div>`;
  }

  function buildZoneFilters(){
    const el=$('zone-filters'); if(!el) return;
    const zones=['Todos',...new Set(state.screens.map(s=>s.zona))];
    el.innerHTML=zones.map(z=>`<button class="chip${z===state.activeZone?' on':''}" data-zone="${esc(z)}">${esc(z)}</button>`).join('');
    el.addEventListener('click',e=>{
      const btn=e.target.closest('[data-zone]'); if(!btn) return;
      state.activeZone=btn.dataset.zone;
      el.querySelectorAll('.chip').forEach(b=>b.classList.toggle('on',b.dataset.zone===state.activeZone));
      state.filtered=state.activeZone==='Todos'?[...state.screens]:state.screens.filter(s=>s.zona===state.activeZone);
      renderCards();
    });
  }

  function renderCards(){
    const el=$('cards'); if(!el) return;
    const cc=$('cat-count'); if(cc) cc.textContent=`${state.filtered.length} pantalla${state.filtered.length!==1?'s':''}`;
    if(!state.filtered.length){ el.innerHTML='<p class="empty">No hay pantallas disponibles en esta zona.</p>'; return; }
    el.innerHTML=state.filtered.map(s=>{
      const inQ=state.quote.has(s.id);
      const initials=esc((s.nombre||'').substring(0,2).toUpperCase());
      return `<article class="card${inQ?' in-quote':''}" data-id="${esc(s.id)}">
        <div class="card-hero">${s.video?`<video src="${esc(s.video)}" autoplay muted loop playsinline></video>`:initials}</div>
        <div class="card-body">
          <div class="card-top"><strong class="card-name">${esc(s.nombre)}</strong><span class="badge ${badgeClass[s.tipo]||''}">${esc(s.tipo)}</span></div>
          <p class="card-zone">${esc(s.zona)}</p>
          <div class="card-stats">
            <span class="mu sm">${fmtImp(s.impactos)} imp/día</span>
            <strong class="card-price">${fmt(s.precio)}<span class="mu" style="font-size:10px;font-weight:400">/sem</span></strong>
          </div>
          ${s.nota?`<p class="card-note">${esc(s.nota)}</p>`:''}
        </div>
        <div class="card-footer"><button class="btn-add${inQ?' on':''}" data-action="toggle-quote" data-id="${esc(s.id)}">${inQ?'✓ En cotizador':'+ Agregar'}</button></div>
      </article>`;
    }).join('');
    el.querySelectorAll('[data-action="toggle-quote"]').forEach(btn=>{
      btn.addEventListener('click',()=>toggleQuote(btn.dataset.id));
    });
  }

  function toggleQuote(id){
    const s=state.screens.find(x=>x.id===id); if(!s) return;
    state.quote.has(id)?state.quote.delete(id):state.quote.set(id,s);
    renderCards(); renderQuote();
    localStorage.setItem('smartkit_quote', JSON.stringify([...state.quote.keys()]));
    toast(state.quote.has(id)?`${s.nombre} agregada al cotizador`:`${s.nombre} quitada`);
  }

  function renderQuote(){
    const items=[...state.quote.values()];
    const w=state.weeks;
    const totalInv=items.reduce((a,s)=>a+s.precio*w,0);
    const totalImp=items.reduce((a,s)=>a+s.impactos,0)*w*7;
    const hasItems=items.length>0;

    const st=$('q-status'); if(st){ st.textContent=hasItems?'Listo':'Vacío'; st.className='q-status'+(hasItems?' ready':''); }
    const sc=$('q-sum-count'); if(sc) sc.textContent=hasItems?`${items.length} pantalla${items.length!==1?'s':''}`:' 0 pantallas · Sin plan armado';
    const sd=$('q-sum-detail'); if(sd) sd.textContent=hasItems?`${fmtImp(totalImp)} impactos totales estimados`:'Agregá pantallas para estimar inversión';

    const ql=$('q-list'); if(ql){
      ql.innerHTML=items.map(s=>`
        <div class="q-item">
          <div class="q-item-info">
            <strong>${esc(s.nombre)}</strong>
            <span>${esc(s.zona)} · ${esc(s.tipo)}</span>
          </div>
          <div class="q-item-right"><span class="q-price">${fmt(s.precio*w)}</span><button class="q-rm" data-id="${esc(s.id)}" title="Quitar">✕</button></div>
        </div>`).join('')||`<p class="mu sm" style="padding:8px 0">Sin pantallas agregadas.</p>`;
      ql.querySelectorAll('.q-rm').forEach(b=>b.addEventListener('click',()=>{state.quote.delete(b.dataset.id);renderCards();renderQuote();}));
    }

    const el=(id,val)=>{const e=$(id);if(e)e.textContent=val;};
    el('q-count',items.length);
    el('q-impacts',fmtImp(totalImp));
    el('q-total',fmt(totalInv));

    const mkBtn=$('btn-mk'), waBtn=$('btn-wa'), hint=$('q-hint');
    if(mkBtn){mkBtn.disabled=!hasItems;}
    if(waBtn){waBtn.disabled=!hasItems;}
    if(hint){hint.style.display=hasItems?'none':'block';}
  }

  function setupDuration(){
    const sel=$('dur-select'); if(!sel) return;
    state.weeks=parseInt(sel.value)||4;
    sel.addEventListener('change',()=>{state.weeks=parseInt(sel.value)||1;renderQuote();});
  }

  // ── Actions ──
  function setupActions(){
    $('btn-mk')?.addEventListener('click', generateKit);
    $('btn-wa')?.addEventListener('click', sendWhatsApp);
    $('mk-close')?.addEventListener('click',()=>$('mk-overlay').classList.remove('open'));
    $('mk-overlay')?.addEventListener('click',e=>{ if(e.target===$('mk-overlay')) $('mk-overlay').classList.remove('open'); });
  }

  function generateKit(){
    const items=[...state.quote.values()]; if(!items.length) return;
    const c=window.CONFIG||{};
    const w=state.weeks;
    const totalInv=items.reduce((a,s)=>a+s.precio*w,0);
    const totalImp=items.reduce((a,s)=>a+s.impactos,0);
    const id='kit-'+Date.now().toString(36);
    const now=new Date();
    const exp=new Date(now.getTime()+15*86400000);
    const weekLabel={1:'1 semana',2:'2 semanas',4:'4 semanas (1 mes)',8:'8 semanas',12:'12 semanas'}[w]||`${w} semanas`;
    const kit={id,createdAt:now.toISOString(),validUntil:exp.toISOString(),brand:c.brand||'SmartKit',weeks:w,weekLabel,
      screens:items.map(s=>({...s,precioCampana:s.precio*w})),
      totals:{screens:items.length,impactsPerDay:totalImp,impactsTotal:totalImp*w*7,investment:totalInv},
      terms:c.terms||'',};
    const all=(() =>{try{return JSON.parse(localStorage.getItem('sk_v1_public-kits')||'{}');}catch{return{};}})();
    all[id]=kit; localStorage.setItem('sk_v1_public-kits',JSON.stringify(all));
    renderKitModal(kit);
    toast('✓ Media kit generado. Redirigiendo...', 2000);
    setTimeout(()=> window.location.href = `mediakit.html?id=${id}`, 1000);
  }

  function renderKitModal(kit){
    const overlay=$('mk-overlay'), content=$('mk-content'); if(!overlay||!content) return;
    const now=new Date();
    const validStr=new Date(kit.validUntil).toLocaleDateString('es-AR');
    content.innerHTML=`
      <div class="mk-hero">
        <h2>${esc(kit.brand)} · Propuesta Comercial</h2>
        <p class="mk-meta">Generado: ${now.toLocaleDateString('es-AR')} · Duración: ${esc(kit.weekLabel)} · Válida hasta: ${validStr}</p>
      </div>
      <div class="mk-kpis">
        <div class="mk-kpi"><b>${kit.totals.screens}</b><span>Pantallas</span></div>
        <div class="mk-kpi"><b>${fmtImp(kit.totals.impactsTotal)}</b><span>Impactos totales</span></div>
        <div class="mk-kpi"><b>${fmt(kit.totals.investment)}</b><span>Inversión total</span></div>
      </div>
      <div class="mk-section">
        <h3>Detalle de pantallas</h3>
        ${kit.screens.map(s=>`<div class="mk-screen-row"><div><strong>${esc(s.nombre)}</strong><br><span class="mu sm">${esc(s.zona)} · ${esc(s.tipo)} · ${fmtImp(s.impactos)} imp/día</span></div><strong>${fmt(s.precioCampana)}</strong></div>`).join('')}
      </div>
      <div class="mk-section">
        <h3>Condiciones</h3>
        <div class="mk-terms">${esc(kit.terms)}</div>
      </div>
      <div class="mk-footer">
        <button class="btn" onclick="printKit()">Imprimir / PDF</button>
        <button class="btn wa" onclick="sendKitWhatsApp()">Enviar por WhatsApp</button>
        <button class="btn" onclick="downloadKit('${esc(kit.id)}')">Descargar JSON</button>
      </div>`;
    overlay.classList.add('open');
    window._currentKit=kit;
  }

  window.printKit=()=>{ window.print(); };
  window.sendKitWhatsApp=()=>{
    const kit=window._currentKit; if(!kit) return;
    const c=window.CONFIG||{};
    const wa=c.whatsapp||''; if(!wa){alert('Configurá el WhatsApp en config.js');return;}
    const lines=[`Hola! Te comparto la propuesta comercial SmartKit:`,``,`Duración: ${kit.weekLabel}`,
      ...kit.screens.map(s=>`• ${s.nombre} (${s.zona}) — ${fmt(s.precioCampana)}`),``,
      `Inversión total: ${fmt(kit.totals.investment)}`,`Válida hasta: ${new Date(kit.validUntil).toLocaleDateString('es-AR')}`,];
    window.open(`https://wa.me/${wa.replace(/\D/g,'')}?text=${encodeURIComponent(lines.join('\n'))}`, '_blank');
  };
  window.downloadKit=id=>{
    const all=(() =>{try{return JSON.parse(localStorage.getItem('sk_v1_public-kits')||'{}');}catch{return{};}})();
    const kit=all[id]; if(!kit) return;
    const a=document.createElement('a');
    a.href='data:application/json,'+encodeURIComponent(JSON.stringify(kit,null,2));
    a.download=id+'.json'; a.click();
  };

  // This function is now in mediakit.html
  window.loadKit=id=>{
    const all=(() =>{try{return JSON.parse(localStorage.getItem('sk_v1_public-kits')||'{}');}catch{return{};}})();
    const kit=all[id]; if(kit) renderKitModal(kit);
  };

  function sendWhatsApp(){
    const c=window.CONFIG||{};
    const wa=c.whatsapp||''; if(!wa){alert('Configurá el WhatsApp en config.js');return;}
    const items=[...state.quote.values()];
    const w=state.weeks;
    const total=items.reduce((a,s)=>a+s.precio*w,0);
    const lines=[`Hola! Me interesa cotizar las siguientes pantallas SmartKit:`,``,
      ...items.map(s=>`• ${s.nombre} (${s.zona}) — ${fmt(s.precio*w)}`),``,
      `Duración: ${w} semana${w!==1?'s':''}`,`Inversión estimada: ${fmt(total)}`,];
    window.open(`https://wa.me/${wa.replace(/\D/g,'')}?text=${encodeURIComponent(lines.join('\n'))}`, '_blank');
  }

  // ── Init ──
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',boot):boot();
})();