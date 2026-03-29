import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ShoppingCart, LogOut } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <nav className="glassmorphism sticky top-0 z-50 px-6 py-4 flex justify-between items-center max-w-7xl mx-auto mt-4 rounded-2xl mb-8">
      {/* Left side: Logo */}
      <div className="flex items-center gap-8">
        <Link to="/" className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 flex items-center gap-2 transition hover:scale-105">
          <ShoppingCart size={28} className="text-blue-400" />
          Campus Kart
        </Link>
      </div>
      
      {/* Right side: Authenticated Links or Auth Buttons */}
      <div className="flex items-center gap-6">
        {!user && null}

        {user && (
          <>
            {user.role === 'admin' && (
              <Link to="/admin" className="text-yellow-400 font-bold hover:text-white transition group relative px-2 py-1">
                Admin Panel
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-yellow-400 transition-all group-hover:w-full"></span>
              </Link>
            )}
            <Link to="/sell" className="text-green-300 hover:text-white transition group relative px-2 py-1">
              Sell Product
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-400 transition-all group-hover:w-full"></span>
            </Link>
            <Link to="/products" className="text-gray-200 hover:text-white transition group relative px-2 py-1">
              Marketplace
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-400 transition-all group-hover:w-full"></span>
            </Link>
            <Link to="/auctions" className="text-gray-200 hover:text-white transition group relative px-2 py-1">
              Auctions
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-400 transition-all group-hover:w-full"></span>
            </Link>
            <Link to="/chat" className="text-green-300 font-bold hover:text-white transition group relative px-2 py-1">
              Live Chat
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-500 transition-all group-hover:w-full"></span>
            </Link>
            <button onClick={logout} className="ml-4 flex items-center gap-2 bg-red-500 bg-opacity-20 hover:bg-opacity-40 text-red-200 hover:text-white border border-red-500 border-opacity-30 rounded-xl px-4 py-2 transition-all">
              <LogOut size={18} />
              Quit
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
