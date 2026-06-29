/* ═══════════════════════════════════════════
   CONFIG
══════════════════════════════════════════════ */
const DEFAULT_CFG = {
  brand:'SmartKit',logo:'SK',whatsapp:'5492616000000',
  terms:'Inicio de campaña sujeto a disponibilidad y aprobación de piezas. Valores en ARS.',
  heroTitle:'Pantallas DOOH · Mendoza',validityDays:15,
};

/* ═══════════════════════════════════════════
   DASHBOARD APP
══════════════════════════════════════════════ */
(function(){
'use strict';

// ── Keys ──
const K_STATE='sk_v1_dashboard-state';
const K_KITS='sk_v1_public-kits';
const K_CFG='sk_v1_config';

// ── State ──
let screens=[];       // merged screens (base + overrides)
let filtered=[];      // current filter result
let selected=new Set(); // selected screen IDs
let currentEdit=null; // screen being edited
let dirtyScreens=new Set(); // screens with unsaved changes
let cfg={};
let sortKey='nombre', sortDir=1;
let kitSelected=new Set(); // IDs selected for current kit
let currentSection='inventory';

// ── Helpers ──
const $=id=>document.getElementById(id);
const fmt=n=>'$'+Math.round(n).toLocaleString('es-AR');
const fmtImp=n=>n>=1000?(n/1000).toFixed(1)+'k':String(n);
const esc=s=>String(s??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const badgeClass={Peatonal:'bd-p',Vehicular:'bd-v',Mixto:'bd-m'};

let toastTimer;
function toast(msg,type=''){
  const t=$('toast'); t.textContent=msg; t.className='toast show'+(type?' '+type:'');
  clearTimeout(toastTimer); toastTimer=setTimeout(()=>t.classList.remove('show'),2400);
}

function markDirty(){
  dirtyScreens.add(currentEdit);
  $('unsaved').style.display='inline-flex';
}

// ── Boot ──
function boot(){
  loadCfg();
  loadScreens();
  setupSidebar();
  setupNav();
  setupFilters();
  setupTable();
  setupBulk();
  setupExport();
  setupSave();
  setupSettings();
  switchSection('inventory');
}

// ── Config ──
function loadCfg(){
  try{ cfg={...DEFAULT_CFG,...JSON.parse(localStorage.getItem(K_CFG)||'{}')}; }
  catch{ cfg={...DEFAULT_CFG}; }
  applyBrand();
  loadSettingsForm();
}

function applyBrand(){
  const el=id=>document.getElementById(id);
  ['dash-logo'].forEach(id=>{const e=el(id);if(e)e.textContent=cfg.logo;});
  ['dash-brand'].forEach(id=>{const e=el(id);if(e)e.textContent=cfg.brand;});
}

function loadSettingsForm(){
  const v=(id,val)=>{const e=$(id);if(e)e.value=val??'';};
  v('cfg-brand',cfg.brand); v('cfg-logo',cfg.logo); v('cfg-wa',cfg.whatsapp);
  v('cfg-terms',cfg.terms); v('cfg-hero',cfg.heroTitle);
  const sel=$('cfg-validity'); if(sel) sel.value=cfg.validityDays||15;
}

function setupSettings(){
  $('btn-cfg-save')?.addEventListener('click',()=>{
    cfg.brand=$('cfg-brand')?.value||'SmartKit';
    cfg.logo=$('cfg-logo')?.value||'SK';
    cfg.whatsapp=$('cfg-wa')?.value||'';
    cfg.terms=$('cfg-terms')?.value||'';
    cfg.heroTitle=$('cfg-hero')?.value||'';
    cfg.validityDays=parseInt($('cfg-validity')?.value)||15;
    localStorage.setItem(K_CFG,JSON.stringify(cfg));
    applyBrand();
    toast('Configuración guardada',  'ok');
  });
}

// ── Screens ──
function loadScreens(){
  let overlay={};
  try{ overlay=JSON.parse(localStorage.getItem(K_STATE)||'{}'); }catch{}
  const baseScreens = window.SCREENS || [];
  screens=baseScreens.map(s=>({...s,...(overlay[s.id]||{})}));
  filtered=[...screens];
  buildZoneFilter();
  buildKitZoneFilter();
  renderTable();
  renderKPIs();
  renderMetrics();
  renderKitScreenList();
  renderKitHistory();
}

function saveChanges(){
  const overlay={};
  screens.forEach(s=>{
    const base=(window.SCREENS || []).find(b=>b.id===s.id);
    if(!base) return;
    const diff={};
    ['nombre','zona','precio','status','video','nota'].forEach(k=>{
      if(s[k]!==base[k]) diff[k]=s[k];
    });
    if(Object.keys(diff).length) overlay[s.id]=diff;
  });
  localStorage.setItem(K_STATE,JSON.stringify(overlay));
  dirtyScreens.clear();
  $('unsaved').style.display='none';
  toast('Cambios guardados. El brochure los refleja al recargar.','ok');
}

// ── Sidebar ──
function setupSidebar(){
  $('sb-toggle')?.addEventListener('click',()=>$('app').classList.toggle('nav-collapsed'));
}

function setupNav(){
  document.querySelectorAll('[data-sec]').forEach(btn=>{
    btn.addEventListener('click',()=>switchSection(btn.dataset.sec));
  });
}

function switchSection(sec){
  currentSection=sec;
  document.querySelectorAll('.section').forEach(s=>s.classList.remove('on'));
  document.querySelectorAll('.nav-btn').forEach(b=>b.classList.toggle('on',b.dataset.sec===sec));
  const el=$('sec-'+sec); if(el) el.classList.add('on');
  const titles={inventory:'Gestión de pantallas',mediakits:'Media Kits',metrics:'Métricas',settings:'Configuración'};
  const descs={inventory:'Inventario, disponibilidad y precios desde una sola superficie.',
    mediakits:'Creá y gestioná propuestas comerciales para clientes.',
    metrics:'Reach diario, distribución por zona y tipo de tránsito.',
    settings:'Marca, condiciones y configuración global.'};
  $('page-title').textContent=titles[sec]||'';
  $('page-desc').textContent=descs[sec]||'';
  const showBtns=sec==='inventory';
  $('btn-export').style.display=showBtns?'':'none';
  $('btn-save').style.display=showBtns?'':'none';
}

// ── Filters ──
function buildZoneFilter(){
  const sel=$('f-zone'); if(!sel) return;
  const zones=['Todos',...new Set(screens.map(s=>s.zona))];
  sel.innerHTML=zones.map(z=>`<option>${z}</option>`).join('');
}

function buildKitZoneFilter(){
  ['kit-zone'].forEach(id=>{
    const sel=$(id); if(!sel) return;
    const zones=['Todas',...new Set(screens.map(s=>s.zona))];
    sel.innerHTML=zones.map(z=>`<option>${z}</option>`).join('');
  });
}

function setupFilters(){
  ['f-search','f-zone','f-type','f-status'].forEach(id=>{
    $(id)?.addEventListener('input',applyFilters);
    $(id)?.addEventListener('change',applyFilters);
  });
}

function applyFilters(){
  const q=($('f-search')?.value||'').toLowerCase();
  const zone=$('f-zone')?.value||'Todos';
  const tipo=$('f-type')?.value||'Todos';
  const st=$('f-status')?.value||'Todos';
  filtered=screens.filter(s=>{
    if(q&&!((s.nombre||'').toLowerCase().includes(q)||(s.zona||'').toLowerCase().includes(q))) return false;
    if(zone!=='Todos'&&s.zona!==zone) return false;
    if(tipo!=='Todos'&&s.tipo!==tipo) return false;
    if(st!=='Todos'&&s.status!==st) return false;
    return true;
  });
  renderTable();
}

// ── Table ──
function setupTable(){
  document.querySelectorAll('th.sort').forEach(th=>{
    th.addEventListener('click',()=>{
      if(sortKey===th.dataset.k) sortDir*=-1; else {sortKey=th.dataset.k;sortDir=1;}
      document.querySelectorAll('th.sort').forEach(t=>t.classList.remove('sort-on'));
      th.classList.add('sort-on');
      renderTable();
    });
  });
  $('sel-all')?.addEventListener('change',e=>{
    if(e.target.checked) filtered.forEach(s=>selected.add(s.id));
    else selected.clear();
    renderTable();
    updateBulk();
  });
}

function renderTable(){
  const tbody=$('screen-tbody'); if(!tbody) return;
  const sorted=[...filtered].sort((a,b)=>{
    const av=a[sortKey]??'', bv=b[sortKey]??'';
    return typeof av==='number'?(av-bv)*sortDir:String(av).localeCompare(String(bv))*sortDir;
  });
  const rc=$('result-count'); if(rc) rc.textContent=`${sorted.length} resultado${sorted.length!==1?'s':''}`;

  tbody.innerHTML=sorted.map(s=>{
    const isSel=selected.has(s.id);
    const ini=esc((s.nombre||'').substring(0,2).toUpperCase());
    const iconCls={Vehicular:'v',Mixto:'m'}[s.tipo]||'';
    return `<tr class="${isSel?'sel':''}" data-id="${esc(s.id)}">
      <td><input type="checkbox" class="row-cb" data-id="${esc(s.id)}" ${isSel?'checked':''}></td>
      <td>
        <div class="sc-cell">
          <div class="sc-icon ${iconCls}">${ini}</div>
          <div><div class="sc-name">${esc(s.nombre)}</div><div class="sc-zone">${esc(s.zona)}</div></div>
        </div>
      </td>
      <td><span class="badge ${badgeClass[s.tipo]||''}">${esc(s.tipo)}</span></td>
      <td>${fmtImp(s.impactos)}</td>
      <td><span style="font-family:monospace;font-weight:700;color:var(--pdk)">${fmt(s.precio)}</span></td>
      <td><span class="badge ${s.status==='Activo'?'bd-ok':'bd-mu'}">${esc(s.status)}</span></td>
      <td>
        <div class="row-acts">
          <button class="icon-btn" data-action="edit" data-id="${esc(s.id)}" title="Editar">✏️</button>
          <button class="icon-btn ${s.status==='Activo'?'paus':'pub'}" data-action="toggle-status" data-id="${esc(s.id)}" title="${s.status==='Activo'?'Pausar':'Publicar'}">
            ${s.status==='Activo'?'⏸':'▶️'}
          </button>
        </div>
      </td>
    </tr>`;
  }).join('');

  // Row events
  tbody.querySelectorAll('.row-cb').forEach(cb=>{
    cb.addEventListener('change',e=>{
      e.target.checked?selected.add(e.target.dataset.id):selected.delete(e.target.dataset.id);
      const row=e.target.closest('tr'); if(row) row.classList.toggle('sel',e.target.checked);
      updateBulk();
    });
  });
  tbody.querySelectorAll('[data-action="edit"]').forEach(btn=>{
    btn.addEventListener('click',()=>openEditor(btn.dataset.id));
  });
  tbody.querySelectorAll('[data-action="toggle-status"]').forEach(btn=>{
    btn.addEventListener('click',()=>{
      const s=screens.find(x=>x.id===btn.dataset.id); if(!s) return;
      s.status=s.status==='Activo'?'Pausado':'Activo';
      dirtyScreens.add(s.id); $('unsaved').style.display='inline-flex';
      renderTable(); renderKPIs(); toast(`${s.nombre}: ${s.status}`);
    });
  });
}

// ── Editor ──
function openEditor(id){
  const s=screens.find(x=>x.id===id); if(!s) return;
  currentEdit=id;
  $('ed-title').textContent=s.nombre;
  $('editor-body').innerHTML=`
    <div class="preview">
      <div class="preview-hero" id="prev-hero">${s.video?`<video src="${esc(s.video)}" autoplay muted loop playsinline></video>`:esc((s.nombre||'').substring(0,2).toUpperCase())}</div>
      <div class="preview-body">
        <h3>${esc(s.nombre)}</h3>
        <p>${esc(s.zona)} · <span class="badge ${badgeClass[s.tipo]||''}">${esc(s.tipo)}</span></p>
        <div class="metrics-mini">
          <div class="metric-mini"><span>Impactos/día</span><b>${fmtImp(s.impactos)}</b></div>
          <div class="metric-mini"><span>Precio/sem</span><b>${fmt(s.precio)}</b></div>
        </div>
      </div>
    </div>
    <div style="display:grid;gap:10px">
      <div class="field"><label>Nombre comercial</label><input id="ed-name" value="${esc(s.nombre)}"></div>
      <div class="field"><label>Zona</label><input id="ed-zone" value="${esc(s.zona)}"></div>
      <div class="field"><label>Precio semanal (ARS)</label><input id="ed-price" type="number" min="1" value="${s.precio}"></div>
      <div class="field"><label>Estado</label>
        <select id="ed-status"><option ${s.status==='Activo'?'selected':''}>Activo</option><option ${s.status==='Pausado'?'selected':''}>Pausado</option></select>
      </div>
      <div class="field"><label>Video del hero (path o URL)</label><input id="ed-video" value="${esc(s.video||'')}"></div>
      <div class="field"><label>Nota interna</label><textarea id="ed-note">${esc(s.nota||'')}</textarea></div>
      <button class="btn ok" id="btn-apply">Aplicar cambios</button>
    </div>
    <div class="status-line"><span>Pantalla ID</span><strong>${esc(s.id)}</strong></div>`;

  $('btn-apply')?.addEventListener('click',()=>applyEdit(id));
  // Live video preview
  $('ed-video')?.addEventListener('input',e=>{
    const h=$('prev-hero'); if(!h) return;
    h.innerHTML=e.target.value?`<video src="${esc(e.target.value)}" autoplay muted loop playsinline></video>`:esc((s.nombre||'').substring(0,2).toUpperCase());
  });
}

function applyEdit(id){
  const s=screens.find(x=>x.id===id); if(!s) return;
  s.nombre=$('ed-name')?.value||s.nombre;
  s.zona=$('ed-zone')?.value||s.zona;
  s.precio=parseFloat($('ed-price')?.value)||s.precio;
  s.status=$('ed-status')?.value||s.status;
  s.video=$('ed-video')?.value||'';
  s.nota=$('ed-note')?.value||'';
  markDirty(); renderTable(); renderKPIs(); renderMetrics();
  toast(`${s.nombre} actualizada`);
  $('ed-title').textContent=s.nombre;
}

// ── Bulk ──
function setupBulk(){
  document.querySelectorAll('[data-bulk]').forEach(btn=>{
    btn.addEventListener('click',()=>{
      const st=btn.dataset.bulk;
      selected.forEach(id=>{const s=screens.find(x=>x.id===id); if(s){s.status=st;dirtyScreens.add(id);}});
      $('unsaved').style.display='inline-flex';
      selected.clear(); updateBulk(); renderTable(); renderKPIs();
      toast(`${st==='Activo'?'Publicadas':'Pausadas'} las pantallas seleccionadas`);
    });
  });
  $('bulk-clear')?.addEventListener('click',()=>{selected.clear();updateBulk();renderTable();});
}

function updateBulk(){
  const bar=$('bulk-bar'), cnt=$('bulk-count');
  if(bar) bar.classList.toggle('show',selected.size>0);
  if(cnt) cnt.textContent=selected.size;
  const sa=$('sel-all'); if(sa) sa.checked=filtered.length>0&&filtered.every(s=>selected.has(s.id));
}

// ── KPIs ──
function renderKPIs(){
  const el=$('kpis-row'); if(!el) return;
  const total=screens.length;
  const active=screens.filter(s=>s.status==='Activo').length;
  const reach=screens.filter(s=>s.status==='Activo').reduce((a,s)=>a+(s.impactos||0),0);
  const rev=screens.filter(s=>s.status==='Activo').reduce((a,s)=>a+(s.precio||0),0);
  const cpms=screens.filter(s=>s.status==='Activo'&&s.impactos>0).map(s=>((s.precio||0)/(s.impactos/1000)*1000/7));
  const cpm=cpms.length?cpms.reduce((a,b)=>a+b,0)/cpms.length:0;
  el.innerHTML=`
    <div class="kpi highlight"><b>${active} / ${total}</b><span>Activas / inventario</span></div>
    <div class="kpi"><b>${active}</b><span>Pantallas activas</span></div>
    <div class="kpi"><b>${fmtImp(reach)}</b><span>Impactos diarios</span></div>
    <div class="kpi"><b>${fmt(rev)}</b><span>Potencial semanal</span></div>
    <div class="kpi"><b>${fmt(Math.round(cpm))}</b><span>CPM promedio</span></div>`;
}

// ── Export ──
function setupExport(){
  $('btn-export')?.addEventListener('click',()=>{
    const rows=[['ID','Nombre','Zona','Tipo','Impactos/día','Precio/sem','Estado']];
    filtered.forEach(s=>rows.push([s.id,s.nombre,s.zona,s.tipo,s.impactos,s.precio,s.status]));
    const csv=rows.map(r=>r.map(v=>`"${String(v??'').replace(/"/g,'""')}"`).join(',')).join('\n');
    const a=document.createElement('a');
    a.href='data:text/csv;charset=utf-8,\uFEFF'+encodeURIComponent(csv);
    a.download='smartkit-inventario.csv'; a.click();
    toast('CSV exportado');
  });
}

function setupSave(){
  $('btn-save')?.addEventListener('click',saveChanges);
}

// ── Metrics ──
function renderMetrics(){
  // By zone
  const byZone={};
  screens.filter(s=>s.status==='Activo').forEach(s=>{
    byZone[s.zona]=(byZone[s.zona]||0)+s.impactos;
  });
  const maxZ=Math.max(...Object.values(byZone),1);
  $('chart-zones').innerHTML=Object.entries(byZone).sort((a,b)=>b[1]-a[1]).map(([z,v])=>`
    <div class="chart-row">
      <div class="chart-meta"><span>${esc(z)}</span><span>${fmtImp(v)} imp/día</span></div>
      <div class="bar-track"><div class="bar-fill" style="width:${(v/maxZ*100).toFixed(1)}%"></div></div>
    </div>`).join('');

  // By type
  const byType={};
  screens.filter(s=>s.status==='Activo').forEach(s=>{
    byType[s.tipo]=(byType[s.tipo]||0)+s.impactos;
  });
  const maxT=Math.max(...Object.values(byType),1);
  $('chart-types').innerHTML=Object.entries(byType).sort((a,b)=>b[1]-a[1]).map(([t,v])=>`
    <div class="chart-row">
      <div class="chart-meta"><span>${esc(t)}</span><span>${fmtImp(v)} imp/día</span></div>
      <div class="bar-track"><div class="bar-fill" style="width:${(v/maxT*100).toFixed(1)}%"></div></div>
    </div>`).join('');
}

// ── Media Kit Builder ──
function renderKitScreenList(){
  const el=$('kit-screen-list'); if(!el) return;
  const zone=$('kit-zone')?.value||'Todas';
  const visible=screens.filter(s=>s.status==='Activo'&&(zone==='Todas'||s.zona===zone));
  el.innerHTML=visible.map(s=>`
    <div class="kit-row">
      <input type="checkbox" class="kit-cb" data-id="${esc(s.id)}" ${kitSelected.has(s.id)?'checked':''}>
      <div>
        <strong style="font-size:13px">${esc(s.nombre)}</strong>
        <div style="color:var(--mu);font-size:11px">${esc(s.zona)} · ${esc(s.tipo)} · ${fmtImp(s.impactos)} imp/día</div>
      </div>
      <span style="font-family:monospace;font-size:12px;font-weight:700;color:var(--pdk)">${fmt(s.precio)}/sem</span>
    </div>`).join('');
  el.querySelectorAll('.kit-cb').forEach(cb=>{
    cb.addEventListener('change',e=>{
      e.target.checked?kitSelected.add(e.target.dataset.id):kitSelected.delete(e.target.dataset.id);
      updateKitPreview();
    });
  });
  updateKitPreview();
}

$('kit-zone')?.addEventListener('change',()=>renderKitScreenList());
['kit-client','kit-contact','kit-dur','kit-validity','kit-notes'].forEach(id=>{
  document.addEventListener('DOMContentLoaded',()=>{
    $(id)?.addEventListener('input',updateKitPreview);
    $(id)?.addEventListener('change',updateKitPreview);
  });
});

function updateKitPreview(){
  const cnt=$('kit-sel-count'); if(cnt) cnt.textContent=`${kitSelected.size} seleccionada${kitSelected.size!==1?'s':''}`;
  const badge=$('kit-draft-badge'); if(badge) badge.textContent=kitSelected.size?'Listo':'Borrador';
  const el=$('kit-preview'); if(!el) return;
  const client=$('kit-client')?.value||'Cliente';
  const contact=$('kit-contact')?.value||'';
  const weeks=parseInt($('kit-dur')?.value)||4;
  const validity=parseInt($('kit-validity')?.value)||15;
  const notes=$('kit-notes')?.value||'';
  const items=screens.filter(s=>kitSelected.has(s.id));
  const totalInv=items.reduce((a,s)=>a+s.precio*weeks,0);
  const totalImp=items.reduce((a,s)=>a+s.impactos,0)*weeks*7;
  const now=new Date();
  const validUntil=new Date(now.getTime()+validity*86400000);
  const weekLabel={1:'1 semana',2:'2 semanas',4:'4 semanas',8:'8 semanas',12:'12 semanas'}[weeks]||`${weeks} semanas`;

  el.innerHTML=`
    <div class="kit-doc-hero">
      <h3>${esc(cfg.brand||'SmartKit')} · Propuesta Comercial</h3>
      <div style="font-size:12px;opacity:.8">Para: ${esc(client)}${contact?` (${esc(contact)})`:''} · ${now.toLocaleDateString('es-AR')}</div>
      <div style="font-size:11px;opacity:.7;margin-top:3px">Duración: ${weekLabel} · Válida hasta ${validUntil.toLocaleDateString('es-AR')}</div>
    </div>
    <div class="kit-doc-body">
      <div class="kit-kpis">
        <div class="kit-kpi"><b>${items.length}</b><span>Pantallas</span></div>
        <div class="kit-kpi"><b>${fmtImp(totalImp)}</b><span>Impactos totales</span></div>
        <div class="kit-kpi"><b>${fmt(totalInv)}</b><span>Inversión total</span></div>
      </div>
      ${items.length?`<div>${items.map(s=>`
        <div class="kit-sc-row">
          <div><strong>${esc(s.nombre)}</strong><br><span style="color:var(--mu);font-size:11px">${esc(s.zona)} · ${fmtImp(s.impactos)} imp/día</span></div>
          <strong>${fmt(s.precio*weeks)}</strong>
        </div>`).join('')}</div>`:'<p style="color:var(--mu);font-size:12px;text-align:center;padding:16px 0">Seleccioná pantallas para armar la propuesta.</p>'}
      ${notes?`<div class="kit-terms">${esc(notes)}</div>`:''}
      <div class="kit-terms">${esc(cfg.terms||DEFAULT_CFG.terms)}</div>
    </div>`;
}

function renderKitHistory(){
  const el=$('kit-history'); if(!el) return;
  let all={};
  try{ all=JSON.parse(localStorage.getItem(K_KITS)||'{}'); }catch{}
  const kits=Object.values(all).sort((a,b)=>(b.createdAt||'').localeCompare(a.createdAt||''));
  if(!kits.length){
    el.innerHTML='<p style="color:var(--mu);font-size:12px;padding:4px">Sin propuestas guardadas todavía.</p>';
    return;
  }
  el.innerHTML=kits.map(k=>`
    <div class="kit-hist-row ${k.archived?'arch':''}">
      <div>
        <strong style="font-size:13px">${esc(k.client||k.brand||'Sin cliente')}</strong>
        <div style="color:var(--mu);font-size:11px">${new Date(k.createdAt).toLocaleDateString('es-AR')} · ${k.weekLabel||''} · ${fmt(k.totals?.investment||0)}</div>
      </div>
      <div style="display:flex;gap:5px">
        <button class="btn sm" data-action="load-kit" data-id="${esc(k.id)}">Ver</button>
        <button class="btn sm" data-action="dl-kit" data-id="${esc(k.id)}">↓</button>
        <button class="btn sm" data-action="arch-kit" data-id="${esc(k.id)}">${k.archived?'Restaurar':'Archivar'}</button>
        <button class="btn sm danger" data-action="del-kit" data-id="${esc(k.id)}">✕</button>
      </div>
    </div>`).join('');
  el.querySelectorAll('[data-action="load-kit"]').forEach(btn=>btn.addEventListener('click',()=>loadKitIntoBuilder(btn.dataset.id)));
  el.querySelectorAll('[data-action="dl-kit"]').forEach(btn=>btn.addEventListener('click',()=>downloadKit(btn.dataset.id)));
  el.querySelectorAll('[data-action="arch-kit"]').forEach(btn=>btn.addEventListener('click',()=>archiveKit(btn.dataset.id)));
  el.querySelectorAll('[data-action="del-kit"]').forEach(btn=>btn.addEventListener('click',()=>deleteKit(btn.dataset.id)));
}

function saveKit(){
  const items=screens.filter(s=>kitSelected.has(s.id));
  if(!items.length){toast('Seleccioná al menos una pantalla','err');return;}
  const client=$('kit-client')?.value||'';
  const contact=$('kit-contact')?.value||'';
  const weeks=parseInt($('kit-dur')?.value)||4;
  const validity=parseInt($('kit-validity')?.value)||15;
  const notes=$('kit-notes')?.value||'';
  const weekLabel={1:'1 semana',2:'2 semanas',4:'4 semanas',8:'8 semanas',12:'12 semanas'}[weeks]||`${weeks} semanas`;
  const id='kit-'+Date.now().toString(36);
  const now=new Date();
  const totalInv=items.reduce((a,s)=>a+s.precio*weeks,0);
  const totalImp=items.reduce((a,s)=>a+s.impactos,0);
  const kit={id,client,contact,createdAt:now.toISOString(),
    validUntil:new Date(now.getTime()+validity*86400000).toISOString(),
    brand:cfg.brand||'SmartKit',weeks,weekLabel,notes,
    screens:items.map(s=>({...s,precioCampana:s.precio*weeks})),
    totals:{screens:items.length,impactsPerDay:totalImp,impactsTotal:totalImp*weeks*7,investment:totalInv},
    terms:cfg.terms||DEFAULT_CFG.terms};
  let all={};
  try{ all=JSON.parse(localStorage.getItem(K_KITS)||'{}'); }catch{}
  all[id]=kit; localStorage.setItem(K_KITS,JSON.stringify(all));
  renderKitHistory(); toast(`Propuesta archivada para ${client||'cliente'}`,  'ok');
}

function loadKitIntoBuilder(id){
  let all={};
  try{ all=JSON.parse(localStorage.getItem(K_KITS)||'{}'); }catch{}
  const kit=all[id]; if(!kit) return;
  kitSelected=new Set((kit.screens||[]).map(s=>s.id));
  if($('kit-client')) $('kit-client').value=kit.client||'';
  if($('kit-contact')) $('kit-contact').value=kit.contact||'';
  if($('kit-dur')) $('kit-dur').value=kit.weeks||4;
  if($('kit-notes')) $('kit-notes').value=kit.notes||'';
  renderKitScreenList(); toast('Propuesta cargada en el constructor');
}

function downloadKit(id){
  let all={};
  try{ all=JSON.parse(localStorage.getItem(K_KITS)||'{}'); }catch{}
  const kit=all[id]; if(!kit) return;
  const a=document.createElement('a');
  a.href='data:application/json,'+encodeURIComponent(JSON.stringify(kit,null,2));
  a.download=id+'.json'; a.click();
}

function archiveKit(id){
  let all={};
  try{ all=JSON.parse(localStorage.getItem(K_KITS)||'{}'); }catch{}
  if(!all[id]) return;
  all[id].archived=!all[id].archived;
  localStorage.setItem(K_KITS,JSON.stringify(all));
  renderKitHistory();
  toast(all[id].archived?'Propuesta archivada':'Propuesta restaurada');
}

function deleteKit(id){
  if(!confirm('¿Eliminar esta propuesta? Esta acción no se puede deshacer.')) return;
  let all={};
  try{ all=JSON.parse(localStorage.getItem(K_KITS)||'{}'); }catch{}
  delete all[id]; localStorage.setItem(K_KITS,JSON.stringify(all));
  renderKitHistory(); toast('Propuesta eliminada');
}

// ── Wire up deferred events ──
document.addEventListener('DOMContentLoaded',()=>{
  ['kit-client','kit-contact','kit-dur','kit-validity','kit-notes'].forEach(id=>{
    $(id)?.addEventListener('input',updateKitPreview);
    $(id)?.addEventListener('change',updateKitPreview);
  });
  $('kit-zone')?.addEventListener('change',()=>renderKitScreenList());
  $('btn-save-kit')?.addEventListener('click',saveKit);
});

// ── Init ──
document.readyState==='loading'
  ?document.addEventListener('DOMContentLoaded',boot)
  :boot();

})();