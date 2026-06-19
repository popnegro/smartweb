import React, { useState } from 'react';
import { Lock } from 'lucide-react';
import { CONFIG } from './config';

const LoginForm = ({ onLogin, onCancel }) => {
  const [password, setPassword] = useState("");
  
  const handleLogin = (e) => {
    e.preventDefault();
    if (password === CONFIG.ADMIN_PASSWORD) {
      onLogin();
    } else {
      alert("Contraseña incorrecta");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[70vh] p-6">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-sm space-y-6 border border-gray-100 animate-in fade-in zoom-in-95 duration-300">
        <div className="text-center space-y-2">
          <div className="bg-blue-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto text-blue-600 mb-2">
            <Lock size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Acceso Admin</h2>
          <p className="text-sm text-gray-500">Ingresa la contraseña para gestionar la tienda</p>
        </div>
        <input 
          type="password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Contraseña"
          className="w-full p-4 border rounded-2xl outline-none focus:ring-2 ring-blue-500 transition-all text-center text-lg"
          autoFocus
        />
        <div className="flex gap-3">
          <button type="submit" className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-100">Entrar</button>
          <button type="button" onClick={onCancel} className="flex-1 bg-gray-100 text-gray-600 py-4 rounded-2xl font-bold hover:bg-gray-200 transition">Cancelar</button>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;