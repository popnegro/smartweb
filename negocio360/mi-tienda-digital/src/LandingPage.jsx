import React, { useState, useMemo } from 'react';
import { Search, Plus } from 'lucide-react';

const LandingPage = ({ promos, products, addToCart }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("Todos");

  const categories = useMemo(() => ["Todos", ...new Set(products.map(p => p.category))], [products]);

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = activeCategory === "Todos" || p.category === activeCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="pb-20">
      <header className="bg-blue-600 text-white py-12 px-6 text-center">
        <h2 className="text-3xl font-bold mb-2">Tu Tienda Digital</h2>
        <p className="opacity-80">Selecciona productos y haz tu pedido por WhatsApp</p>
      </header>

      <section className="sticky top-[72px] z-40 bg-gray-50/95 backdrop-blur-sm py-4 px-6 border-b">
        <div className="max-w-6xl mx-auto space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" placeholder="¿Qué estás buscando?..." 
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl shadow-sm outline-none focus:ring-2 ring-blue-500"
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map(cat => (
              <button 
                key={cat} onClick={() => setActiveCategory(cat)}
                className={`px-6 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${activeCategory === cat ? "bg-blue-600 text-white shadow-md" : "bg-white text-gray-500 border border-gray-200"}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {!searchTerm && activeCategory === "Todos" && (
        <section className="p-6 max-w-6xl mx-auto grid md:grid-cols-2 gap-4">
          {promos.map(p => (
            <div key={p.id} className="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-blue-500 flex justify-between items-center">
              <div>
                <h4 className="font-bold text-lg">{p.title}</h4>
                <p className="text-gray-500 text-sm">{p.desc}</p>
                <p className="text-blue-600 font-bold mt-1">${p.price}</p>
              </div>
              <button onClick={() => addToCart({id: p.id, name: p.title, price: p.price})} className="bg-blue-600 text-white p-3 rounded-full hover:scale-105 transition"><Plus/></button>
            </div>
          ))}
        </section>
      )}

      <section className="p-8 max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {filteredProducts.map(product => (
            <div key={product.id} className="bg-white rounded-2xl shadow-sm border p-4 group hover:shadow-xl transition-all">
              <div className="h-32 bg-gray-50 rounded-xl mb-4 flex items-center justify-center overflow-hidden">
                {product.image ? (
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-gray-300 font-bold uppercase text-[10px]">{product.category}</span>
                )}
              </div>
              <h4 className="font-bold text-gray-800 h-10 overflow-hidden line-clamp-2">{product.name}</h4>
              <p className="text-blue-600 font-black text-lg mb-4">${product.price}</p>
              <button onClick={() => addToCart(product)} className="w-full bg-gray-900 text-white py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition"><Plus size={14}/> Agregar</button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default LandingPage;