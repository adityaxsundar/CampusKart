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
import Auctions from './components/Auctions';
import AuctionRoom from './components/AuctionRoom';
import Profile from './components/Profile';

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
              <Route path="/auction/bidding" element={<AuctionRoom />} />
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
