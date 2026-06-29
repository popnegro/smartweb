/* ══════════════════════════════════════════════
   inventory-data.js — Fuente de datos única para el inventario DOOH
═══════════════════════════════════════════════ */
const SCREENS = [
  // Datos fusionados y estandarizados
  {id:'sc-1',nombre:'Peatonal Sarmiento',zona:'Microcentro',tipo:'Peatonal',impactos:52000,precio:95000,status:'Activo',lat:-32.8931,lng:-68.8449,nota:'Peatonal Sarmiento 150',video:'./assets/videos/peatonal-sarmiento.mp4'},
  {id:'sc-2',nombre:'San Martin & Belgrano',zona:'Microcentro',tipo:'Vehicular',impactos:38000,precio:80000,status:'Activo',lat:-32.8890,lng:-68.8442,nota:'Av. San Martin 600',video:'./assets/videos/sarmiento-y-belgrano.mp4'},
  {id:'sc-3',nombre:'Plaza Independencia',zona:'Microcentro',tipo:'Mixto',impactos:68000,precio:140000,status:'Activo',lat:-32.8908,lng:-68.8388,nota:'Plaza Independencia Este',video:'./assets/videos/plaza-independencia.mp4'},
  {id:'sc-4',nombre:'Terminal de Omnibus',zona:'Microcentro',tipo:'Peatonal',impactos:29000,precio:65000,status:'Activo',lat:-32.8866,lng:-68.8328,nota:'Av. G. Videla s/n',video:'./assets/videos/chacras.mp4'},
  {id:'sc-5',nombre:'Av. Las Heras & Espana',zona:'Microcentro',tipo:'Vehicular',impactos:33000,precio:72000,status:'Activo',lat:-32.8831,lng:-68.8358,nota:'Av. Las Heras 800',video:'./assets/videos/maipu.mp4'},
  {id:'sc-6',nombre:'Av. Colon & Catamarca',zona:'Microcentro',tipo:'Vehicular',impactos:21000,precio:55000,status:'Activo',lat:-32.8950,lng:-68.8410,nota:'Av. Colon 1200',video:'./assets/videos/palmares.mp4'},
  {id:'sc-7',nombre:'Palmares Open Mall',zona:'Las Heras',tipo:'Mixto',impactos:75000,precio:165000,status:'Activo',lat:-32.8532,lng:-68.8344,nota:'Acceso Norte km 8',video:'./assets/videos/palmares.mp4'},
  {id:'sc-10',nombre:'Godoy Cruz Centro',zona:'Godoy Cruz',tipo:'Vehicular',impactos:31000,precio:70000,status:'Activo',lat:-32.9183,lng:-68.8397,nota:'Av. San Martin 3500',video:'./assets/videos/sarmiento-y-belgrano.mp4'},
  {id:'sc-13',nombre:'Mendoza Plaza Shopping',zona:'Guaymallen',tipo:'Mixto',impactos:72000,precio:158000,status:'Activo',lat:-32.8894,lng:-68.8094,nota:'Acceso Este 3280',video:'./assets/videos/plaza-independencia.mp4'},
  {id:'sc-16',nombre:'Maipu Centro',zona:'Maipu',tipo:'Mixto',impactos:16000,precio:44000,status:'Activo',lat:-32.9500,lng:-68.7950,nota:'Av. Urquiza 1200',video:'./assets/videos/maipu.mp4'},
  {id:'sc-18',nombre:'Lujan de Cuyo Centro',zona:'Lujan de Cuyo',tipo:'Mixto',impactos:14000,precio:40000,status:'Activo',lat:-32.9700,lng:-68.8600,nota:'Av. San Martin 1100',video:'./assets/videos/chacras.mp4'},
  {id:'sc-19',nombre:'Sarmiento y 9 de Julio',zona:'Centro',tipo:'Peatonal',impactos:14200,precio:95000,status:'Activo',lat:-32.8894,lng:-68.8458,nota:'Esquina comercial de máximo tránsito peatonal.'},
  {id:'sc-20',nombre:'Av. Aristides frente al Parque',zona:'Ciudad',tipo:'Vehicular',impactos:31000,precio:185000,status:'Activo',lat:-32.8908,lng:-68.8762,nota:'Avenida principal. Ideal autos y commuters.'},
  {id:'sc-21',nombre:'Guaymallén Centro',zona:'Guaymallen',tipo:'Peatonal',impactos:11400,precio:78000,status:'Activo',lat:-32.8955,lng:-68.8212,nota:'Centro comercial de Guaymallén.'},
  {id:'sc-22',nombre:'Maipú Ruta 7',zona:'Maipu',tipo:'Vehicular',impactos:19600,precio:112000,status:'Activo',lat:-32.9812,lng:-68.7757,nota:'Tránsito hacia bodegas y aeropuerto.'},
  {id:'sc-23',nombre:'Villanueva Gomensoro',zona:'Las Heras',tipo:'Mixto',impactos:9300,precio:72000,status:'Activo',lat:-32.8658,lng:-68.8415,nota:'Zona residencial-comercial en crecimiento.'},
  {id:'sc-24',nombre:'Godoy Cruz Belgrano',zona:'Godoy Cruz',tipo:'Vehicular',impactos:25800,precio:155000,status:'Activo',lat:-32.9246,lng:-68.8488,nota:'Corredor vehicular de alto volumen.'},
  {id:'sc-25',nombre:'Chacras de Coria Acceso',zona:'Lujan de Cuyo',tipo:'Vehicular',impactos:16700,precio:125000,status:'Activo',lat:-33.0158,lng:-68.8642,nota:'Acceso a Chacras. Ideal turismo y bodegas.'},
  {id:'sc-26',nombre:'Parque San Martín',zona:'Ciudad',tipo:'Mixto',impactos:15500,precio:110000,status:'Activo',lat:-32.8950,lng:-68.8600,nota:'Entrada principal al parque, alto tráfico de fin de semana.',video:'./assets/videos/parque.mp4'}
];