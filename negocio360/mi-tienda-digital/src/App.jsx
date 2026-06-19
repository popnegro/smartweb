import React, { useState, useEffect } from 'react';
import { ShoppingCart, Settings, Layout } from 'lucide-react';
import { CONFIG } from './config';

import LandingPage from './components/LandingPage';
import LoginForm from './components/LoginForm';
import AdminPanel from './components/AdminPanel';
import CartModal from './components/CartModal';

function App() {
  const [view, setView] = useState('landing');
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  // --- AUTENTICACIÓN ---
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('is_authenticated') === 'true';
  });
  
  // --- PERSISTENCIA ---
  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem('store_products');
    return saved ? JSON.parse(saved) : [
      { id: 1, name: "Zapatillas Runner", price: 45000, category: "Calzado", image: "" },
      { id: 2, name: "Remera Algodón", price: 12000, category: "Ropa", image: "" },
      { id: 3, name: "Gorra Snapback", price: 8000, category: "Accesorios", image: "" }
    ];
  });

  const [promos, setPromos] = useState(() => {
    const saved = localStorage.getItem('store_promos');
    return saved ? JSON.parse(saved) : [
      { id: 101, title: 'Oferta de Verano', desc: '30% off', price: 15000 }
    ];
  });

  useEffect(() => {
    localStorage.setItem('store_products', JSON.stringify(products));
    localStorage.setItem('store_promos', JSON.stringify(promos));
    localStorage.setItem('is_authenticated', isAuthenticated.toString());
  }, [products, promos, isAuthenticated]);

  const addToCart = (item) => {
    setCart([...cart, { ...item, cartId: Date.now() }]);
  };

  const sendOrderWhatsApp = () => {
    const total = cart.reduce((acc, item) => acc + item.price, 0);
    let message = `*NUEVO PEDIDO*\n--------------------------\n`;
    cart.forEach((item, i) => message += `${i + 1}. ${item.name} - $${item.price}\n`);
    message += `--------------------------\n*TOTAL: $${total}*`;
    window.open(`https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <nav className="bg-white shadow-sm p-4 flex justify-between items-center sticky top-0 z-50">
        <h1 className="text-xl font-bold text-blue-600">Store Manager PRO</h1>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setView(view === 'admin' ? 'landing' : 'admin')} 
            className="flex items-center gap-2 text-sm font-semibold bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 transition"
          >
            {view === 'admin' ? <Layout size={18}/> : <Settings size={18}/>}
            {view === 'admin' ? 'Ver Tienda' : 'Panel Admin'}
          </button>
          
          <button onClick={() => setIsCartOpen(true)} className="relative p-2 bg-blue-600 text-white rounded-full">
            <ShoppingCart size={20} />
            {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">{cart.length}</span>}
          </button>
        </div>
      </nav>

      {view === 'landing' ? (
        <LandingPage promos={promos} products={products} addToCart={addToCart} />
      ) : !isAuthenticated ? (
        <LoginForm onLogin={() => setIsAuthenticated(true)} onCancel={() => setView('landing')} />
      ) : (
        <AdminPanel 
          products={products} 
          setProducts={setProducts} 
          promos={promos} 
          setPromos={setPromos} 
          onLogout={() => { setIsAuthenticated(false); setView('landing'); }}
        />
      )}

      {isCartOpen && (
        <CartModal cart={cart} setIsCartOpen={setIsCartOpen} removeFromCart={(id) => setCart(cart.filter(c => c.cartId !== id))} sendOrder={sendOrderWhatsApp} />
      )}
    </div>
  );
}

export default App
