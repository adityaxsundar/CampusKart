import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { CheckCircle, XCircle } from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const [pendingProducts, setPendingProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  if (!user || user.role !== 'admin') {
    return <div className="text-center mt-20 text-red-500 font-bold text-2xl">Access Denied: Admin Clearance Required.</div>;
  }

  const fetchPending = async () => {
    try {
      const token = localStorage.getItem('token');
      if(!token) return;
      const { data } = await axios.get('http://localhost:5000/api/products/admin/pending', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPendingProducts(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleAction = async (id, action) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/products/admin/approve/${id}`, 
        { action }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Remove dynamically from screen
      setPendingProducts(pendingProducts.filter(p => p._id !== id));
    } catch (err) {
      alert(`Failed to ${action} product.`);
    }
  };

  if (loading) return <div className="text-center mt-20 text-white">Loading Admin Panel...</div>;

  return (
    <div className="max-w-7xl mx-auto px-6 pt-10 pb-20 fade-in text-white min-h-[70vh]">
      <h1 className="text-4xl font-extrabold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 tracking-tight flex items-center gap-3">
        Admin Moderation Dashboard
      </h1>

      <p className="mb-6 text-gray-400 text-lg border-b border-gray-600 border-opacity-30 pb-4">
        Review unverified products submitted by students. Approve to list them immediately, or remove them for violating policies.
      </p>

      {pendingProducts.length === 0 ? (
        <div className="glass-card text-center text-gray-300 py-10 opacity-70">No pending products waiting for verification. Good job!</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pendingProducts.map((p) => (
            <div key={p._id} className="glassmorphism p-5 transition hover:scale-[1.02] transform duration-300 border border-transparent hover:border-yellow-500 hover:border-opacity-30 flex flex-col justify-between">
              
              <div className="relative mb-4">
                {p.productPic ? (
                   <img src={p.productPic} alt="Product view" className="w-full h-48 object-cover rounded-xl shadow-lg border border-gray-600 border-opacity-40" />
                ) : (
                   <div className="w-full h-48 rounded-xl shadow-lg border border-gray-600 border-opacity-40 bg-gray-800 flex items-center justify-center text-gray-500">No Image</div>
                )}
                <div className="absolute top-2 right-2 bg-yellow-500 text-black text-xs font-bold px-3 py-1 rounded-full animate-pulse shadow-xl">
                  Pending Verification
                </div>
              </div>

              <h2 className="text-xl font-bold mb-1 text-blue-100">{p.title}</h2>
              <p className="text-sm text-gray-400 mb-3 truncate" title={p.description}>"{p.description}"</p>
              
              <div className="flex justify-between items-center text-sm mb-4">
                <span className="text-gray-300">Seller: <b className="text-gray-100">{p.seller.name}</b></span>
                <span className="font-extrabold text-[#74E0A1]">₹ {p.price}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-3 mt-auto border-t border-gray-700 pt-4">
                <button 
                  onClick={() => handleAction(p._id, 'approve')} 
                  className="flex justify-center items-center gap-2 bg-green-500 bg-opacity-20 hover:bg-opacity-80 text-green-300 hover:text-white border border-green-500 border-opacity-40 rounded-xl px-4 py-2 transition shadow-md font-bold"
                >
                  <CheckCircle size={18} /> Approve
                </button>
                <button 
                  onClick={() => handleAction(p._id, 'reject')} 
                  className="flex justify-center items-center gap-2 bg-red-500 bg-opacity-20 hover:bg-opacity-80 text-red-300 hover:text-white border border-red-500 border-opacity-40 rounded-xl px-4 py-2 transition shadow-md font-bold"
                >
                  <XCircle size={18} /> Delete
                </button>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
