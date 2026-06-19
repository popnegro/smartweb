import React from 'react';
import { X, Trash, ShoppingCart, MessageCircle } from 'lucide-react';

const CartModal = ({ cart, setIsCartOpen, removeFromCart, sendOrder }) => (
  <div className="fixed inset-0 z-[60] flex justify-end">
    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setIsCartOpen(false)} />
    <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col">
      <div className="p-6 border-b bg-blue-600 text-white flex justify-between items-center">
        <h2 className="font-black text-xl">Mi Carrito</h2>
        <button onClick={() => setIsCartOpen(false)}><X/></button>
      </div>
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {cart.length === 0 ? <p className="text-center text-gray-400 mt-10">Vacío</p> : 
          cart.map(item => (
            <div key={item.cartId} className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl border">
              <div><p className="font-bold">{item.name}</p><p className="text-blue-600 font-black">${item.price}</p></div>
              <button onClick={() => removeFromCart(item.cartId)} className="text-red-400"><Trash size={18}/></button>
            </div>
          ))
        }
      </div>
      {cart.length > 0 && (
        <div className="p-6 border-t">
          <div className="flex justify-between mb-6 font-black text-2xl"><span>Total:</span><span>${cart.reduce((a, b) => a + b.price, 0)}</span></div>
          <button onClick={sendOrder} className="w-full bg-green-500 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-3"><MessageCircle /> Enviar Pedido</button>
        </div>
      )}
    </div>
  </div>
);

export default CartModal;