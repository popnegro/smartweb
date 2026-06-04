import { useState, useRef } from "react";
import Papa from "papaparse";
import * as XLSX from "xlsx";

const TENANTS = {
  norte: { name: "Depósito Norte", icon: "ti-building-warehouse", primary: "#185FA5", light: "#E6F1FB", pill: "#B5D4F4", pillText: "#0C447C" },
  max: { name: "Ferretería Max", icon: "ti-tool", primary: "#854F0B", light: "#FAEEDA", pill: "#FAC775", pillText: "#633806" },
  sur: { name: "Distribuidora Sur", icon: "ti-package", primary: "#0F6E56", light: "#E1F5EE", pill: "#9FE1CB", pillText: "#085041" },
};

const SAMPLE = `Producto,Costo,Precio,Stock,Ventas_Mes
Aceite Girasol 1L,450,750,200,180
Arroz Largo Fino 1kg,380,580,500,20
Detergente Limón 750ml,320,520,150,140
Papel Higiénico x4,680,980,80,75
Fideos Spaghetti 500g,290,450,1000,15
Lavandina 1L,180,320,300,290
Azúcar 1kg,420,650,120,110
Harina 0000 1kg,310,480,400,8
Jabón en Polvo 1kg,890,1350,60,58
Yerba Mate 500g,1200,1800,250,230
Vinagre Blanco 1L,160,280,180,5
Mayonesa 500g,750,1150,90,85
Sal Fina 1kg,120,200,350,340
Galletitas Dulces 200g,380,580,70,65
Lentejas 500g,280,450,600,3`;

const TIPO = {
  stock_muerto: { icon: "ti-box-off", color: "#A32D2D", bg: "#FCEBEB", border: "#F7C1C1", label: "Stock muerto" },
  quiebre_riesgo: { icon: "ti-alert-triangle", color: "#854F0B", bg: "#FAEEDA", border: "#FAC775", label: "Riesgo de quiebre" },
  baja_rentabilidad: { icon: "ti-trending-down", color: "#533AB7", bg: "#EEEDFE", border: "#CECBF6", label: "Baja rentabilidad" },
  estrella: { icon: "ti-star", color: "#0F6E56", bg: "#E1F5EE", border: "#9FE1CB", label: "Producto estrella" },
  oportunidad_precio: { icon: "ti-bulb", color: "#185FA5", bg: "#E6F1FB", border: "#B5D4F4", label: "Oportunidad de precio" },
};

const PRIO_COLOR = { alta: "#A32D2D", media: "#854F0B", baja: "#0F6E56" };
const PRIO_BG = { alta: "#FCEBEB", media: "#FAEEDA", baja: "#E1F5EE" };

export default function App() {
  const [tid, setTid] = useState("norte");
  const [step, setStep] = useState(1);
  const [rows, setRows] = useState([]);
  const [cols, setCols] = useState([]);
  const [report, setReport] = useState(null);
  const [err, setErr] = useState("");
  const [drag, setDrag] = useState(false);
  const fileRef = useRef();
  const t = TENANTS[tid];

  const parse = (file) => {
    setErr("");
    const ext = file.name.split(".").pop().toLowerCase();
    if (ext === "csv") {
      Papa.parse(file, { header: true, skipEmptyLines: true, complete: (r) => { setCols(Object.keys(r.data[0] || {})); setRows(r.data); setStep(2); } });
    } else if (["xlsx", "xls"].includes(ext)) {
      const reader = new FileReader();
      reader.onload = (e) => { const wb = XLSX.read(e.target.result, { type: "array" }); const ws = wb.Sheets[wb.SheetNames[0]]; const j = XLSX.utils.sheet_to_json(ws); setCols(Object.keys(j[0] || {})); setRows(j); setStep(2); };
      reader.readAsArrayBuffer(file);
    } else setErr("Formato no válido. Usá CSV, XLSX o XLS.");
  };

  const loadSample = () => {
    Papa.parse(SAMPLE, { header: true, skipEmptyLines: true, complete: (r) => { setCols(Object.keys(r.data[0] || {})); setRows(r.data); setStep(2); } });
  };

  const g = (row, keys) => { for (const k of keys) { const v = parseFloat(row[k] ?? row[k?.toLowerCase()] ?? row[k?.toUpperCase()]); if (!isNaN(v)) return v; } return 0; };

  const diagnose = async () => {
    setStep(3);
    setErr("");
    const summary = rows.map(row => {
      const costo = g(row, ["Costo","costo","COSTO"]);
      const precio = g(row, ["Precio","precio","PRECIO"]);
      const stock = g(row, ["Stock","stock","STOCK"]);
      const ventas = g(row, ["Ventas_Mes","ventas_mes","Ventas","ventas","VENTAS"]);
      const margen = precio > 0 ? +((precio - costo) / precio * 100).toFixed(1) : 0;
      const rotacion = stock > 0 ? +(ventas / stock * 100).toFixed(1) : 0;
      return { producto: row.Producto || row.producto || row.PRODUCTO || "—", costo, precio, stock, ventas, margen, rotacion };
    });
    const prompt = `Sos un experto en gestión de inventario para depósitos y distribuidoras en Argentina. Analizá estos datos y respondé SOLO con JSON válido, sin markdown ni texto extra.

Datos: ${JSON.stringify(summary)}

Estructura requerida:
{"resumen":{"totalProductos":number,"valorStockTotal":number,"margenPromedio":number,"alertasCriticas":number},"hallazgos":[{"tipo":"stock_muerto"|"quiebre_riesgo"|"baja_rentabilidad"|"estrella"|"oportunidad_precio","prioridad":"alta"|"media"|"baja","titulo":string,"descripcion":string,"productos":[string],"impacto":string,"accion":string}],"recomendaciones":[{"orden":number,"titulo":string,"descripcion":string,"ahorro_estimado":string}],"score":number}

Reglas: stock_muerto=rotación<10% y stock>100; quiebre_riesgo=ventas>80% del stock; baja_rentabilidad=margen<25%; estrella=margen>40% Y rotación>70%; oportunidad_precio=rotación>85%. Score 0-100. Moneda ARS. Sé específico con números.`;
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 2000, messages: [{ role: "user", content: prompt }] }) });
      const d = await res.json();
      const txt = (d.content || []).map(b => b.text || "").join("").replace(/```json|```/g, "").trim();
      setReport(JSON.parse(txt));
      setStep(4);
    } catch { setErr("Error al analizar. Revisá el formato del archivo e intentá de nuevo."); setStep(2); }
  };

  const reset = () => { setStep(1); setRows([]); setCols([]); setReport(null); setErr(""); };

  const scoreColor = (s) => s >= 70 ? "#0F6E56" : s >= 40 ? "#854F0B" : "#A32D2D";

  return (
    <div style={{ fontFamily: "var(--font-sans)", minHeight: "100vh", background: "var(--color-background-tertiary)" }}>

      {/* Header */}
      <header style={{ background: t.primary, padding: "0 20px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 56, gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, color: "white" }}>
          <i className={`ti ${t.icon}`} style={{ fontSize: 20 }} aria-hidden="true" />
          <span style={{ fontWeight: 500, fontSize: 16 }}>{t.name}</span>
          <span style={{ fontSize: 11, background: "rgba(255,255,255,0.18)", padding: "2px 10px", borderRadius: 20, letterSpacing: 0.3 }}>diagnóstico digital</span>
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.65)" }}>demo white-label:</span>
          {Object.entries(TENANTS).map(([k, v]) => (
            <button key={k} onClick={() => setTid(k)} style={{ background: tid === k ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.1)", border: "none", color: "white", padding: "4px 12px", borderRadius: 20, cursor: "pointer", fontSize: 12, fontWeight: tid === k ? 500 : 400 }}>
              {v.name.split(" ")[0]}
            </button>
          ))}
        </div>
      </header>

      {/* Steps */}
      <div style={{ background: "var(--color-background-primary)", borderBottom: "0.5px solid var(--color-border-tertiary)", padding: "0 20px" }}>
        <div style={{ display: "flex", maxWidth: 860, margin: "0 auto" }}>
          {["Cargar archivo", "Vista previa", "Analizando", "Diagnóstico"].map((s, i) => {
            const active = step === i + 1, done = step > i + 1;
            return (
              <div key={i} style={{ padding: "10px 18px", fontSize: 13, fontWeight: active ? 500 : 400, color: active ? t.primary : done ? "var(--color-text-secondary)" : "var(--color-text-tertiary)", borderBottom: active ? `2px solid ${t.primary}` : "2px solid transparent", display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" }}>
                <span style={{ width: 18, height: 18, borderRadius: "50%", background: active ? t.primary : done ? "var(--color-background-secondary)" : "var(--color-background-secondary)", color: active ? "white" : "var(--color-text-secondary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 500 }}>
                  {done ? <i className="ti ti-check" style={{ fontSize: 11 }} /> : i + 1}
                </span>
                {s}
              </div>
            );
          })}
        </div>
      </div>

      <main style={{ maxWidth: 860, margin: "0 auto", padding: "28px 20px" }}>
        {err && <div style={{ background: "#FCEBEB", border: "0.5px solid #F7C1C1", borderRadius: "var(--border-radius-md)", padding: "10px 16px", marginBottom: 20, color: "#791F1F", fontSize: 13, display: "flex", alignItems: "center", gap: 8 }}><i className="ti ti-alert-circle" />{err}</div>}

        {/* STEP 1 */}
        {step === 1 && (
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 500, marginBottom: 6, color: "var(--color-text-primary)" }}>Cargá tu inventario</h2>
            <p style={{ color: "var(--color-text-secondary)", fontSize: 14, marginBottom: 24 }}>Subí un archivo con tus productos, precios, stock y ventas del último mes.</p>
            <div
              onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
              onDragLeave={() => setDrag(false)}
              onDrop={(e) => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files[0]; if (f) parse(f); }}
              onClick={() => fileRef.current.click()}
              style={{ border: `2px dashed ${drag ? t.primary : "var(--color-border-secondary)"}`, borderRadius: "var(--border-radius-lg)", padding: "44px 24px", textAlign: "center", background: drag ? t.light : "var(--color-background-primary)", transition: "all 0.15s", cursor: "pointer" }}
            >
              <i className="ti ti-cloud-upload" style={{ fontSize: 40, color: drag ? t.primary : "var(--color-text-tertiary)", display: "block", marginBottom: 12 }} aria-hidden="true" />
              <p style={{ fontWeight: 500, color: "var(--color-text-primary)", fontSize: 15, marginBottom: 6 }}>Arrastrá tu archivo aquí</p>
              <p style={{ color: "var(--color-text-secondary)", fontSize: 13, marginBottom: 16 }}>o hacé click para seleccionarlo</p>
              <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                {[".csv", ".xlsx", ".xls"].map(f => <span key={f} style={{ background: "var(--color-background-secondary)", color: "var(--color-text-secondary)", padding: "2px 10px", borderRadius: 6, fontSize: 12 }}>{f}</span>)}
              </div>
              <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" onChange={(e) => { if (e.target.files[0]) parse(e.target.files[0]); }} style={{ display: "none" }} />
            </div>

            <div style={{ marginTop: 16, padding: 18, background: "#E1F5EE", borderRadius: "var(--border-radius-lg)", border: "0.5px solid #9FE1CB", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
              <div>
                <p style={{ fontSize: 13, color: "#085041", fontWeight: 500, marginBottom: 2 }}>¿No tenés archivo? Probá con datos de ejemplo</p>
                <p style={{ fontSize: 12, color: "#0F6E56" }}>15 productos simulados de una distribuidora.</p>
              </div>
              <button onClick={loadSample} style={{ background: "#0F6E56", color: "white", border: "none", padding: "8px 18px", borderRadius: "var(--border-radius-md)", fontSize: 13, fontWeight: 500, cursor: "pointer", whiteSpace: "nowrap" }}>
                Cargar ejemplo <i className="ti ti-arrow-right" style={{ fontSize: 13 }} />
              </button>
            </div>

            <div style={{ marginTop: 14, padding: "12px 16px", background: "var(--color-background-secondary)", borderRadius: "var(--border-radius-md)", border: "0.5px solid var(--color-border-tertiary)" }}>
              <p style={{ fontSize: 12, color: "var(--color-text-secondary)", marginBottom: 6 }}>Columnas esperadas:</p>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {["Producto", "Costo", "Precio", "Stock", "Ventas_Mes"].map(c => <code key={c} style={{ background: "var(--color-background-primary)", color: "var(--color-text-primary)", border: "0.5px solid var(--color-border-tertiary)", padding: "2px 8px", borderRadius: 4, fontSize: 12 }}>{c}</code>)}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 500, marginBottom: 4, color: "var(--color-text-primary)" }}>Vista previa del inventario</h2>
                <p style={{ color: "var(--color-text-secondary)", fontSize: 14 }}>{rows.length} productos cargados correctamente</p>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={reset} style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-secondary)", color: "var(--color-text-secondary)", padding: "8px 14px", borderRadius: "var(--border-radius-md)", fontSize: 13, cursor: "pointer" }}>
                  <i className="ti ti-arrow-left" style={{ fontSize: 13 }} /> Cambiar
                </button>
                <button onClick={diagnose} style={{ background: t.primary, color: "white", border: "none", padding: "8px 18px", borderRadius: "var(--border-radius-md)", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
                  <i className="ti ti-search" style={{ fontSize: 13 }} /> Generar diagnóstico
                </button>
              </div>
            </div>
            <div style={{ background: "var(--color-background-primary)", borderRadius: "var(--border-radius-lg)", border: "0.5px solid var(--color-border-tertiary)", overflow: "hidden" }}>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: "var(--color-background-secondary)" }}>
                      {cols.map(c => <th key={c} style={{ padding: "9px 14px", textAlign: "left", fontWeight: 500, color: "var(--color-text-secondary)", borderBottom: "0.5px solid var(--color-border-tertiary)", whiteSpace: "nowrap" }}>{c}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.slice(0, 10).map((row, i) => (
                      <tr key={i} style={{ borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
                        {cols.map(c => <td key={c} style={{ padding: "9px 14px", color: "var(--color-text-primary)" }}>{row[c]}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {rows.length > 10 && <div style={{ padding: "8px 14px", background: "var(--color-background-secondary)", borderTop: "0.5px solid var(--color-border-tertiary)", color: "var(--color-text-tertiary)", fontSize: 12 }}>…y {rows.length - 10} productos más</div>}
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div style={{ textAlign: "center", padding: "72px 0" }}>
            <i className="ti ti-search" style={{ fontSize: 52, color: t.primary, display: "block", marginBottom: 20 }} aria-hidden="true" />
            <h2 style={{ fontSize: 20, fontWeight: 500, color: "var(--color-text-primary)", marginBottom: 8 }}>Analizando tu inventario…</h2>
            <p style={{ color: "var(--color-text-secondary)", fontSize: 14, marginBottom: 28 }}>La IA está procesando {rows.length} productos.</p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
              {["Calculando márgenes", "Detectando stock muerto", "Evaluando rotación", "Generando recomendaciones"].map((label, i) => (
                <div key={i} style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-md)", padding: "6px 14px", fontSize: 12, color: "var(--color-text-secondary)", display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: t.primary, display: "inline-block", opacity: 0.8 }} />
                  {label}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 4 */}
        {step === 4 && report && (
          <div>
            {/* KPIs */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr))", gap: 12, marginBottom: 24 }}>
              <div style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-lg)", padding: "16px 18px" }}>
                <p style={{ fontSize: 12, color: "var(--color-text-secondary)", marginBottom: 6 }}>Score de optimización</p>
                <div style={{ display: "flex", alignItems: "baseline", gap: 3, marginBottom: 8 }}>
                  <span style={{ fontSize: 38, fontWeight: 500, color: scoreColor(report.score) }}>{report.score}</span>
                  <span style={{ fontSize: 14, color: "var(--color-text-tertiary)" }}>/100</span>
                </div>
                <div style={{ height: 5, background: "var(--color-background-secondary)", borderRadius: 3 }}>
                  <div style={{ width: `${report.score}%`, height: "100%", borderRadius: 3, background: scoreColor(report.score) }} />
                </div>
              </div>
              {[
                { icon: "ti-package", label: "Productos", val: report.resumen?.totalProductos ?? rows.length },
                { icon: "ti-chart-bar", label: "Margen promedio", val: `${(report.resumen?.margenPromedio ?? 0).toFixed(1)}%` },
                { icon: "ti-alert-circle", label: "Alertas críticas", val: report.resumen?.alertasCriticas ?? 0 },
              ].map((m, i) => (
                <div key={i} style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-lg)", padding: "16px 18px" }}>
                  <p style={{ fontSize: 12, color: "var(--color-text-secondary)", marginBottom: 6, display: "flex", alignItems: "center", gap: 5 }}><i className={`ti ${m.icon}`} style={{ fontSize: 13 }} />{m.label}</p>
                  <p style={{ fontSize: 28, fontWeight: 500, color: "var(--color-text-primary)" }}>{m.val}</p>
                </div>
              ))}
            </div>

            {/* Hallazgos */}
            <h3 style={{ fontSize: 15, fontWeight: 500, color: "var(--color-text-primary)", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
              <i className="ti ti-search" style={{ fontSize: 16, color: t.primary }} /> Hallazgos del análisis
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
              {report.hallazgos?.map((h, i) => {
                const cfg = TIPO[h.tipo] || { icon: "ti-pin", color: "#5F5E5A", bg: "#F1EFE8", border: "#D3D1C7", label: h.tipo };
                return (
                  <div key={i} style={{ background: cfg.bg, border: `0.5px solid ${cfg.border}`, borderRadius: "var(--border-radius-lg)", padding: "16px 18px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8, gap: 10, flexWrap: "wrap" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <i className={`ti ${cfg.icon}`} style={{ fontSize: 16, color: cfg.color }} aria-hidden="true" />
                        <span style={{ fontWeight: 500, color: cfg.color, fontSize: 14 }}>{h.titulo}</span>
                        <span style={{ fontSize: 11, background: cfg.border, color: cfg.color, padding: "1px 9px", borderRadius: 20 }}>{cfg.label}</span>
                      </div>
                      <span style={{ fontSize: 11, background: PRIO_BG[h.prioridad], color: PRIO_COLOR[h.prioridad], padding: "2px 10px", borderRadius: 20, fontWeight: 500 }}>Prioridad {h.prioridad}</span>
                    </div>
                    <p style={{ fontSize: 13, color: "var(--color-text-secondary)", marginBottom: 8, lineHeight: 1.6 }}>{h.descripcion}</p>
                    {h.productos?.length > 0 && (
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
                        {h.productos.map((p, j) => <span key={j} style={{ background: "var(--color-background-primary)", border: `0.5px solid ${cfg.border}`, color: cfg.color, padding: "2px 10px", borderRadius: 6, fontSize: 12 }}>{p}</span>)}
                      </div>
                    )}
                    <div style={{ display: "flex", gap: 20, fontSize: 12, flexWrap: "wrap" }}>
                      <span style={{ color: "var(--color-text-secondary)" }}><strong>Impacto:</strong> {h.impacto}</span>
                      <span style={{ color: "var(--color-text-secondary)" }}><strong>Acción:</strong> {h.accion}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Recomendaciones */}
            <h3 style={{ fontSize: 15, fontWeight: 500, color: "var(--color-text-primary)", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
              <i className="ti ti-bulb" style={{ fontSize: 16, color: t.primary }} /> Plan de acción
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 10, marginBottom: 28 }}>
              {report.recomendaciones?.map((r, i) => (
                <div key={i} style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-lg)", padding: "16px 18px", display: "flex", gap: 14, alignItems: "flex-start" }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: t.light, color: t.primary, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 500, fontSize: 13, flexShrink: 0, border: `0.5px solid ${t.pill}` }}>{r.orden}</div>
                  <div>
                    <p style={{ fontWeight: 500, color: "var(--color-text-primary)", fontSize: 13, marginBottom: 4 }}>{r.titulo}</p>
                    <p style={{ fontSize: 12, color: "var(--color-text-secondary)", marginBottom: 8, lineHeight: 1.55 }}>{r.descripcion}</p>
                    <span style={{ fontSize: 12, background: "#E1F5EE", color: "#085041", padding: "2px 10px", borderRadius: 20 }}>
                      <i className="ti ti-coin" style={{ fontSize: 11 }} /> {r.ahorro_estimado}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", justifyContent: "center" }}>
              <button onClick={reset} style={{ background: "var(--color-background-primary)", border: `0.5px solid ${t.primary}`, color: t.primary, padding: "9px 22px", borderRadius: "var(--border-radius-md)", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
                <i className="ti ti-arrow-left" style={{ fontSize: 13 }} /> Nuevo diagnóstico
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
