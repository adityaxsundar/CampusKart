import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Login from './components/Login';
import SellProduct from './components/SellProduct';
import AdminDashboard from './components/AdminDashboard';
import Chat from './components/Chat';

import { AuthContext } from './context/AuthContext';
import { useContext } from 'react';

const RootRedirect = () => {
  const { user } = useContext(AuthContext);
  return user ? <Navigate to="/products" replace /> : <Navigate to="/login" replace />;
};

import Products from './components/Products';

import Profile from './components/Profile';

// Placeholder for Auctions Page
const Auctions = () => (
  <div className="flex flex-col items-center justify-center min-h-[50vh] animate-fade-in text-center px-4">
    <h1 className="text-4xl font-black text-teal-400 mb-4 drop-shadow-lg">Live Auctions</h1>
    <p className="text-teal-100 max-w-lg mb-8">
      Place structured bids on real-time timed listings. Your bids will be managed securely over Socket.io connections!
    </p>
    <div className="glass-card w-full max-w-3xl flex items-center justify-center h-64 mt-10">
      <p className="opacity-50 text-2xl tracking-wide font-medium text-teal-50">No Active Auctions Right Now.</p>
    </div>
  </div>
);

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col relative overflow-hidden bg-transparent">
          {/* Subtle decorative background elements updated for teal theme */}
          <div className="fixed top-20 left-10 w-[400px] h-[400px] bg-teal-600 rounded-full mix-blend-screen filter blur-[128px] opacity-20 animate-pulse pointer-events-none -z-10"></div>
          <div className="fixed bottom-20 right-10 w-[400px] h-[400px] bg-teal-400 rounded-full mix-blend-screen filter blur-[128px] opacity-10 animate-pulse delay-500 pointer-events-none -z-10"></div>

          <Navbar />

          <main className="flex-grow z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
            <Routes>
              <Route path="/" element={<RootRedirect />} />
              <Route path="/login" element={<Login />} />
              <Route path="/products" element={<Products />} />
              <Route path="/auctions" element={<Auctions />} />
              <Route path="/sell" element={<SellProduct />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/profile" element={<Profile />} />
              {/* Fallback route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
