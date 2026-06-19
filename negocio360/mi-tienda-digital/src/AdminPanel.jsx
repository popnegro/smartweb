import React, { useState } from 'react';
import { RefreshCw, LogOut, Save, Edit3, Trash, Search, X, Download } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';

const AdminPanel = ({ products, setProducts, promos, setPromos, onLogout }) => {
  const [productForm, setProductForm] = useState({ id: null, name: '', price: '', category: 'General', image: '' });
  const [promoForm, setPromoForm] = useState({ id: null, title: '', desc: '', price: '' });
  const [showPreview, setShowPreview] = useState(false);

  const saveProduct = () => {
    if (!productForm.name || !productForm.price) return alert("Faltan datos");
    if (productForm.id) {
      setProducts(products.map(p => p.id === productForm.id ? { ...productForm, price: parseInt(productForm.price) } : p));
    } else {
      setProducts([...products, { ...productForm, id: Date.now(), price: parseInt(productForm.price) }]);
    }
    setProductForm({ id: null, name: '', price: '', category: 'General', image: '' });
    setShowPreview(false);
  };

  const savePromo = () => {
    if (!promoForm.title || !promoForm.price) return alert("Faltan datos");
    if (promoForm.id) {
      setPromos(promos.map(p => p.id === promoForm.id ? { ...promoForm, price: parseInt(promoForm.price) } : p));
    } else {
      setPromos([...promos, { ...promoForm, id: Date.now(), price: parseInt(promoForm.price) }]);
    }
    setPromoForm({ id: null, title: '', desc: '', price: '' });
  };

  const downloadQRCode = () => {
    const canvas = document.getElementById('qr-code-canvas');
    if (canvas) {
      const pngUrl = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      downloadLink.download = "qr-code-vidriera.png";
      downloadLink.click();
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-12 pb-20">
      <section>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <RefreshCw className="text-blue-500" size={20}/> Promociones
          </h3>
          <button onClick={onLogout} className="flex items-center gap-2 text-sm font-bold text-red-500 bg-red-50 px-4 py-2 rounded-xl hover:bg-red-100 transition">
            <LogOut size={16} />
            Cerrar Sesión
          </button>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border space-y-4">
            <input value={promoForm.title} onChange={e => setPromoForm({...promoForm, title: e.target.value})} placeholder="Título" className="w-full p-3 border rounded-xl" />
            <input value={promoForm.desc} onChange={e => setPromoForm({...promoForm, desc: e.target.value})} placeholder="Desc" className="w-full p-3 border rounded-xl" />
            <input type="number" value={promoForm.price} onChange={e => setPromoForm({...promoForm, price: e.target.value})} placeholder="Precio" className="w-full p-3 border rounded-xl" />
            <button onClick={savePromo} className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2"><Save size={18}/> {promoForm.id ? 'Actualizar' : 'Crear'}</button>
          </div>
          <div className="space-y-2">
            {promos.map(p => (
              <div key={p.id} className="bg-white p-4 rounded-xl border flex justify-between items-center">
                <p className="font-bold">{p.title} - <span className="text-blue-600">${p.price}</span></p>
                <div className="flex gap-2">
                  <button onClick={() => setPromoForm(p)} className="text-blue-500"><Edit3 size={18}/></button>
                  <button onClick={() => setPromos(promos.filter(x => x.id !== p.id))} className="text-red-400"><Trash size={18}/></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t pt-12">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><Edit3 className="text-blue-500" size={20}/> Inventario</h3>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-1 bg-white p-6 rounded-2xl shadow-sm border space-y-4">
            <input value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} placeholder="Nombre" className="w-full p-3 border rounded-xl" />
            <div className="space-y-2">
              <div className="flex gap-2">
                <input value={productForm.image || ''} onChange={e => { setProductForm({...productForm, image: e.target.value}); setShowPreview(false); }} placeholder="URL de la imagen" className="flex-1 p-3 border rounded-xl outline-none focus:ring-2 ring-blue-500" />
                {productForm.image && (
                  <button type="button" onClick={() => setShowPreview(!showPreview)} className="p-3 bg-gray-100 rounded-xl text-gray-600 hover:bg-gray-200 transition" title="Vista previa">
                    <Search size={18} />
                  </button>
                )}
              </div>
              {showPreview && productForm.image && (
                <div className="h-40 bg-gray-50 rounded-xl overflow-hidden border relative animate-in zoom-in-95 duration-200">
                  <img src={productForm.image} alt="Preview" className="w-full h-full object-cover" onError={() => { alert("No se pudo cargar la imagen"); setShowPreview(false); }} />
                  <button onClick={() => setShowPreview(false)} className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70 transition"><X size={14}/></button>
                </div>
              )}
            </div>
            <input type="number" value={productForm.price} onChange={e => setProductForm({...productForm, price: e.target.value})} placeholder="Precio" className="w-full p-3 border rounded-xl" />
            <select value={productForm.category} onChange={e => setProductForm({...productForm, category: e.target.value})} className="w-full p-3 border rounded-xl bg-white">
              <option>General</option><option>Calzado</option><option>Ropa</option><option>Accesorios</option>
            </select>
            <button onClick={saveProduct} className="w-full bg-gray-900 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2"><Save size={18}/> {productForm.id ? 'Actualizar' : 'Añadir'}</button>
          </div>
          <div className="md:col-span-2 overflow-x-auto">
            <table className="w-full bg-white rounded-2xl overflow-hidden border">
              <thead className="bg-gray-50 border-b">
                <tr><th className="p-4 text-left">Producto</th><th className="p-4 text-left">Precio</th><th className="p-4 text-right">Acciones</th></tr>
              </thead>
              <tbody className="divide-y">
                {products.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50 transition">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
                          {p.image ? <img src={p.image} className="w-full h-full object-cover" /> : <span className="text-[8px] text-gray-400">N/A</span>}
                        </div>
                        <p className="font-bold text-gray-700">{p.name}</p>
                      </div>
                    </td>
                    <td className="p-4 font-black text-blue-600">${p.price}</td>
                    <td className="p-4 text-right space-x-2">
                      <button onClick={() => { setProductForm(p); setShowPreview(false); }} className="text-blue-500"><Edit3 size={18}/></button>
                      <button onClick={() => setProducts(products.filter(x => x.id !== p.id))} className="text-red-400"><Trash size={18}/></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <div className="bg-gray-900 text-white p-6 rounded-2xl flex items-center justify-between">
        <div className="space-y-4">
          <div><h3 className="font-bold text-lg">QR de Vidriera</h3><p className="text-gray-400 text-sm">Escanea para abrir la tienda.</p></div>
          <button onClick={downloadQRCode} className="flex items-center gap-2 text-xs bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl transition border border-white/10"><Download size={14} /> Descargar PNG</button>
        </div>
        <div className="bg-white p-2 rounded-lg shadow-xl"><QRCodeCanvas id="qr-code-canvas" value={window.location.origin} size={128} /></div>
      </div>
    </div>
  );
};

export default AdminPanel;