import React, { useEffect, useState, useContext } from 'react';
import api from '../api/axiosInstance';
import { AuthContext } from '../context/AuthContext';
import {
  CheckCircle, XCircle, RefreshCw, Clock, Package,
  Gavel, Edit2, AlertTriangle, User, DollarSign
} from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const [pendingProducts, setPendingProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  if (!user || user.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <AlertTriangle size={48} className="text-red-500" />
        <p className="text-center text-red-500 font-bold text-2xl">Access Denied: Admin Clearance Required.</p>
      </div>
    );
  }

  const fetchPending = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/products/admin/pending');
      setPendingProducts(data.data);
      setLastRefresh(new Date());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
    // Auto-refresh every 30 seconds so admin sees edits without manual reload
    const interval = setInterval(fetchPending, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleAction = async (id, action) => {
    try {
      await api.put(`/products/admin/approve/${id}`, { action });
      setPendingProducts(prev => prev.filter(p => p._id !== id));
    } catch (err) {
      alert(`Failed to ${action} product.`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 pt-10 pb-20 animate-fade-in text-teal-50 min-h-[70vh]">

      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-teal-200 tracking-tight drop-shadow-[0_0_15px_rgba(0,210,255,0.4)]">
          Admin Moderation Dashboard
        </h1>
        <button
          onClick={fetchPending}
          className="flex items-center gap-2 text-sm text-teal-400 border border-teal-500/30 bg-teal-500/10 hover:bg-teal-500/20 px-4 py-2 rounded-xl transition font-bold"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      <div className="flex items-center gap-4 mb-8 border-b border-teal-900/40 pb-4">
        <p className="text-teal-100/60 text-sm">
          Review products pending verification. Items re-submitted after edits are marked <span className="text-amber-400 font-bold">EDITED</span>.
        </p>
        <span className="text-[10px] text-teal-700 ml-auto whitespace-nowrap">
          Last updated: {lastRefresh.toLocaleTimeString()}
        </span>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { icon: Package, label: 'Pending Review',   val: pendingProducts.length,                                       color: 'amber' },
          { icon: Gavel,   label: 'Auction Listings', val: pendingProducts.filter(p => p.listingType === 'auction').length, color: 'rose' },
          { icon: DollarSign, label: 'Fixed Listings', val: pendingProducts.filter(p => p.listingType !== 'auction').length, color: 'teal' },
        ].map(s => (
          <div key={s.label} className={`glass-card flex items-center gap-4 py-4 px-6 border-${s.color}-500/20`}>
            <s.icon size={24} className={`text-${s.color}-400`} />
            <div>
              <p className={`text-2xl font-black text-${s.color}-300`}>{s.val}</p>
              <p className="text-[10px] text-teal-600 font-bold uppercase">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <div key={i} className="glass-card h-72 animate-pulse bg-teal-900/10" />)}
        </div>
      ) : pendingProducts.length === 0 ? (
        <div className="glass-card text-center py-16 border-teal-900/20">
          <CheckCircle size={48} className="text-teal-700 mx-auto mb-4" />
          <p className="text-teal-400 font-bold text-lg">All clear! No products waiting for review.</p>
          <p className="text-teal-700 text-sm mt-1">New submissions will appear here automatically.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pendingProducts.map((p) => {
            // Detect if this is a re-submission after an edit
            // (product was previously available/active — has a history)
            const isEdited = p.updatedAt && p.createdAt &&
              new Date(p.updatedAt) - new Date(p.createdAt) > 60000;

            return (
              <div
                key={p._id}
                className="glass-card p-0 overflow-hidden flex flex-col border-teal-900/30 hover:border-teal-400/30 transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,180,150,0.1)]"
              >
                {/* Image */}
                <div className="relative w-full h-48">
                  {p.productPic ? (
                    <img src={p.productPic} alt={p.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-[#030a0d] flex items-center justify-center text-teal-800">
                      <Package size={40} />
                    </div>
                  )}

                  {/* Status badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                    <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-black px-2.5 py-1 rounded-full animate-pulse">
                      ⏳ Pending Verification
                    </span>
                    {isEdited && (
                      <span className="bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1">
                        <Edit2 size={9} /> EDITED by Seller
                      </span>
                    )}
                  </div>

                  {/* Listing type */}
                  <span className={`absolute top-3 right-3 text-[10px] font-black px-2.5 py-1 rounded-full border ${p.listingType === 'auction' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' : 'bg-teal-500/20 text-teal-400 border-teal-500/30'}`}>
                    {p.listingType === 'auction' ? '🔨 Auction' : '🏷️ Fixed'}
                  </span>
                </div>

                {/* Body */}
                <div className="p-5 flex flex-col flex-1">
                  <h2 className="text-xl font-black text-teal-100 mb-1 truncate">{p.title}</h2>
                  <p className="text-xs text-teal-600 italic mb-3 line-clamp-2">"{p.description}"</p>

                  <div className="flex items-center justify-between text-sm mb-4 border-b border-teal-900/20 pb-3">
                    <div className="flex items-center gap-1.5">
                      <User size={13} className="text-teal-500" />
                      <span className="text-teal-400">Seller: <span className="text-teal-100 font-bold">{p.seller?.name || 'Unknown'}</span></span>
                    </div>
                    <span className="font-black text-green-400 text-lg">
                      ₹{p.listingType === 'auction' ? p.startingBid : (p.askingPrice || p.price)}
                    </span>
                  </div>

                  <div className="text-[10px] text-teal-700 mb-4">
                    Submitted: {new Date(p.createdAt).toLocaleDateString()} &nbsp;|&nbsp;
                    Last edited: {new Date(p.updatedAt).toLocaleDateString()}
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-3 mt-auto">
                    <button
                      onClick={() => handleAction(p._id, 'approve')}
                      className="flex justify-center items-center gap-2 bg-teal-500/10 hover:bg-teal-500/25 text-teal-300 hover:text-white border border-teal-500/30 rounded-xl px-4 py-2.5 transition font-bold text-sm"
                    >
                      <CheckCircle size={16} /> Approve
                    </button>
                    <button
                      onClick={() => handleAction(p._id, 'reject')}
                      className="flex justify-center items-center gap-2 bg-red-500/10 hover:bg-red-500/25 text-red-400 hover:text-white border border-red-500/30 rounded-xl px-4 py-2.5 transition font-bold text-sm"
                    >
                      <XCircle size={16} /> Reject
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
