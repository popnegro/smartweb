/* ══════════════════════════════════════════════
   mediakit.js — Vista pública de propuesta
═══════════════════════════════════════════════ */
(function(){
'use strict';

const K_KITS = 'sk_v1_public-kits';
const K_CFG  = 'sk_v1_config';

const DEFAULT_CFG = {
  brand:'SmartKit',logo:'SK',whatsapp:'5492616000000',
  terms:'Inicio de campaña sujeto a disponibilidad y aprobación de piezas creativas. Valores en ARS. Propuesta válida por 15 días.',
};

const $ = id => document.getElementById(id);
const fmt = n => '$' + Math.round(n).toLocaleString('es-AR');
const fmtImp = n => n >= 1000 ? (n/1000).toFixed(1)+'k' : String(n);
const esc = s => String(s??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const badgeClass = {Peatonal:'bd-p',Vehicular:'bd-v',Mixto:'bd-m'};
const dotColor = {Peatonal:'#0369a1',Vehicular:'#0f766e',Mixto:'#7c3aed'};

// ── Load config ──
let cfg = DEFAULT_CFG;
try{ cfg = {...DEFAULT_CFG,...JSON.parse(localStorage.getItem(K_CFG)||'{}')}; }catch(_){}

// ── Apply brand ──
function applyBrand(){
  const logo=$('brand-logo'), name=$('brand-name');
  if(logo) logo.textContent=cfg.logo;
  if(name) name.textContent=cfg.brand;
  document.title=`${cfg.brand} · Media Kit`;
}

// ── Load kit ──
function loadKit(){
  const params = new URLSearchParams(location.search);
  const id = params.get('id') || '';

  let allKits = {};
  try{ allKits = JSON.parse(localStorage.getItem(K_KITS)||'{}'); }catch(_){}

  // If id provided, look it up; otherwise use most recent kit
  let kit = id ? allKits[id] : null;

  if(!kit && !id){
    // Show latest kit for demo purposes
    const kits = Object.values(allKits).sort((a,b)=>(b.createdAt||'').localeCompare(a.createdAt||''));
    kit = kits[0] || null;
  }

  return kit;
}

// ── Render ──
function init(){
  applyBrand();
  const kit = loadKit();
  if(kit){
    renderKit(kit);
  } else {
    renderEmpty();
  }
}

function renderEmpty(){
  $('app').innerHTML=`
    <div class="empty-state">
      <div class="empty-icon">📋</div>
      <h2>Sin propuesta cargada</h2>
      <p>Generá un media kit desde el brochure seleccionando pantallas y haciendo clic en "Generar media kit". El link que obtenés apunta a esta página.</p>
      <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap">
        <a href="index.html"><button class="btn-pri">Ir al brochure</button></a>
        <a href="dashboard.html"><button class="btn-ghost">Ir al dashboard</button></a>
      </div>
    </div>`;
}

function renderKit(kit){
  const brand = kit.brand || cfg.brand;
  const whatsapp = (kit.whatsapp || cfg.whatsapp || '').replace(/\D/g,'');
  const screens = kit.screens || [];
  const totals = kit.totals || {};
  const now = new Date();
  const createdDate = kit.createdAt ? new Date(kit.createdAt).toLocaleDateString('es-AR') : '—';
  const validDate = kit.validUntil ? new Date(kit.validUntil).toLocaleDateString('es-AR') : '—';
  const isExpired = kit.validUntil ? new Date() > new Date(kit.validUntil) : false;
  const cpm = totals.impactsTotal > 0 ? (totals.investment / totals.impactsTotal * 1000) : 0;
  const clientName = kit.client || kit.clientName || 'Cliente';
  const contactName = kit.contact || '';
  const terms = kit.terms || kit.notes || cfg.terms;

  const waMsg = encodeURIComponent(
    `Hola ${brand}! Quiero avanzar con la propuesta para ${clientName}.\n\nInversión: ${fmt(totals.investment)}\nPantallas: ${totals.screens}\nDuración: ${kit.weekLabel||kit.weeks+' sem'}`
  );
  const waUrl = whatsapp ? `https://wa.me/${whatsapp}?text=${waMsg}` : '#';

  $('app').innerHTML=`
    <!-- HERO -->
    <section class="mk-hero">
      <div class="mk-eyebrow">Propuesta DOOH · ${esc(brand)}</div>
      <h1>${esc(clientName)}</h1>
      <div class="mk-hero-meta">
        ${contactName?`<span>${esc(contactName)} · </span>`:''}
        ${esc(kit.weekLabel||kit.weeks+' semanas')} · Generado el ${createdDate}
      </div>
      <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
        <span style="font-size:12px;opacity:.8">Válida hasta ${validDate}</span>
        ${isExpired?`<span class="expired-badge">⚠ Propuesta vencida</span>`:''}
      </div>
    </section>

    <!-- KPIs -->
    <section class="mk-kpis">
      <div class="mk-kpi"><b>${totals.screens||screens.length}</b><span>Pantallas</span></div>
      <div class="mk-kpi"><b>${fmtImp(totals.impactsTotal||0)}</b><span>Impactos totales</span></div>
      <div class="mk-kpi"><b>${fmt(totals.investment||0)}</b><span>Inversión total</span></div>
      <div class="mk-kpi"><b>${fmt(Math.round(cpm))}</b><span>CPM estimado</span></div>
    </section>

    <!-- MAP + SCREENS -->
    <section class="mk-section">
      <div class="mk-section-head">
        <div>
          <span class="eyebrow">Ubicaciones</span>
          <h2>Pantallas incluidas</h2>
        </div>
        <span style="font-size:12px;color:var(--mu)">${screens.length} pantalla${screens.length!==1?'s':''}</span>
      </div>
      <div id="mk-map"></div>
      ${screens.map(s=>`
        <div class="mk-screen">
          <div class="mk-screen-icon">${esc((s.nombre||s.name||'').substring(0,2).toUpperCase())}</div>
          <div class="mk-screen-info">
            <strong>${esc(s.nombre||s.name||'—')}</strong>
            <span>${esc(s.zona||s.zone||'—')}</span>
            <div class="mk-screen-specs">
              <span class="badge ${badgeClass[s.tipo||s.type]||''}">${esc(s.tipo||s.type||'—')}</span>
              <span class="spec">${fmtImp(s.impactos||s.impactsDay||0)} imp/día</span>
              ${s.dim||s.format?`<span class="spec">${esc(s.dim||s.format)}</span>`:''}
            </div>
          </div>
          <div class="mk-screen-price">
            <strong>${fmt(s.precioCampana||s.precioCampaña||s.subtotal||(s.precio||s.priceWeek||0)*(kit.weeks||1))}</strong>
            <span>campaña ${kit.weekLabel||kit.weeks+' sem'}</span>
          </div>
        </div>`).join('')}
    </section>

    <!-- CONDITIONS -->
    <section class="mk-section">
      <div class="mk-section-head">
        <div>
          <span class="eyebrow">Condiciones</span>
          <h2>Detalle comercial</h2>
        </div>
      </div>
      <div class="mk-conditions">
        <div class="condition-box">
          <h3>Condiciones generales</h3>
          <p>${esc(terms)}</p>
        </div>
        <div class="condition-box">
          <h3>Formatos y entrega</h3>
          <ul>
            <li>Formatos aceptados: MP4 H.264, JPG, PNG</li>
            <li>Resolución mínima: Full HD (1920×1080)</li>
            <li>Entrega de piezas: 72 hs hábiles antes del inicio</li>
            <li>Validez de esta propuesta: hasta ${validDate}</li>
          </ul>
        </div>
        <div class="mk-cta">
          <div class="mk-cta-text">
            <h3>Reservar propuesta</h3>
            <p>Confirmá disponibilidad, fechas y piezas con el equipo comercial.</p>
          </div>
          <div class="mk-cta-actions">
            ${