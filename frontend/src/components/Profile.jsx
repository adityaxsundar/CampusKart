import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Edit2, Trash2, X, Check, Package, Send, XCircle, EyeOff, RotateCcw, CheckCircle2 } from 'lucide-react';

const Profile = () => {
  const { user } = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Edit Modal State
  const [editingProduct, setEditingProduct] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', description: '', price: '', buyingDate: '' });

  useEffect(() => {
    fetchMyProducts();
  }, []);

  const fetchMyProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/products/my-products', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setProducts(res.data.data);
      } else {
        setError('Failed to fetch your products');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching products');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/products/status/${id}`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchMyProducts();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this listing?")) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(products.filter(p => p._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete.');
    }
  };

  const handleEditClick = (product) => {
    setEditingProduct(product._id);
    setEditForm({
      title: product.title,
      description: product.description,
      price: product.price,
      buyingDate: product.buyingDate ? product.buyingDate.split('T')[0] : ''
    });
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/products/${editingProduct}`, editForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Refresh list
      setEditingProduct(null);
      fetchMyProducts();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update product.');
    }
  };

  if (!user) return <div className="text-center mt-20 text-teal-100">Please login to view profile.</div>;

  return (
    <div className="flex flex-col items-center w-full min-h-[60vh] pt-10 px-4 animate-fade-in relative z-10">
      
      <div className="w-full max-w-5xl flex items-center gap-4 mb-8 pb-6 border-b border-teal-900/40">
        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-teal-400 to-blue-500 shadow-[0_0_20px_rgba(0,210,255,0.4)] flex items-center justify-center text-3xl font-black text-[#030a0d]">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <h1 className="text-3xl font-bold text-teal-100 tracking-wide">{user.name}</h1>
          <p className="text-teal-400 font-medium">{user.email}</p>
        </div>
      </div>

      <h2 className="w-full max-w-5xl text-2xl font-bold text-teal-200 flex items-center gap-3 mb-6">
        <Package size={26} className="text-teal-400" /> My Listings
      </h2>

      {loading ? (
        <div className="text-teal-400 animate-pulse text-lg">Loading your listings...</div>
      ) : error ? (
        <div className="text-red-400 border border-red-500/30 bg-red-500/10 px-6 py-3 rounded-lg">{error}</div>
      ) : products.length === 0 ? (
        <div className="glass-card w-full max-w-5xl text-center py-12">
          <p className="opacity-60 text-xl font-medium text-teal-100">You haven't listed any products yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-5xl pb-16">
          {products.map((product) => (
            <div key={product._id} className="glass-card flex flex-col items-start bg-[#050b0f] relative overflow-hidden group border border-teal-900/20 shadow-lg">
              
              <div className="w-full h-48 bg-[#030a0d] relative rounded-t-xl overflow-hidden -mt-6 -mx-6 mb-4 w-[calc(100%+3rem)]">
                {product.productPic ? (
                  <img src={product.productPic} alt={product.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                ) : (
                   <div className="w-full h-full flex items-center justify-center text-teal-800">No Image</div>
                )}
                {/* Status Badge */}
                <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold shadow-md ${
                  product.status === 'available' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 
                  product.status === 'pending_approval' ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30' : 
                  'bg-red-500/20 text-red-400 border border-red-500/30'
                }`}>
                  {product.status.replace('_', ' ').toUpperCase()}
                </div>
              </div>

              <div className="flex-grow w-full flex flex-col">
                <h3 className="text-xl font-bold text-teal-50 mb-1">{product.title}</h3>
                <p className="text-teal-700 font-extrabold text-2xl mb-4">₹{product.price}</p>
                <div className="mt-auto flex flex-col gap-2 border-t border-teal-900/30 pt-4">
                  {/* DRAFT STATE */}
                  {product.status === 'draft' && (
                    <>
                      <div className="grid grid-cols-2 gap-3 mb-1">
                        <button onClick={() => handleEditClick(product)} className="flex items-center justify-center gap-2 text-sm bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 py-2 rounded-lg transition border border-teal-500/20">
                          <Edit2 size={16} /> Edit
                        </button>
                        <button onClick={() => handleDelete(product._id)} className="flex items-center justify-center gap-2 text-sm bg-red-500/10 hover:bg-red-500/20 text-red-400 py-2 rounded-lg transition border border-red-500/20">
                          <Trash2 size={16} /> Delete
                        </button>
                      </div>
                      <button onClick={() => handleStatusChange(product._id, 'pending_approval')} className="flex items-center justify-center gap-2 text-sm bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 w-full py-2 rounded-lg transition border border-blue-500/40 font-bold">
                        <Send size={16} /> Send for Verification
                      </button>
                    </>
                  )}

                  {/* PENDING APPROVAL STATE */}
                  {product.status === 'pending_approval' && (
                    <button onClick={() => handleStatusChange(product._id, 'draft')} className="flex items-center justify-center gap-2 text-sm bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 w-full py-2 rounded-lg transition border border-yellow-500/30 font-bold">
                      <XCircle size={16} /> Cancel Request
                    </button>
                  )}

                  {/* REMOVED STATE (by Admin or Self) */}
                  {product.status === 'removed' && (
                    <>
                      <div className="grid grid-cols-2 gap-3 mb-1">
                        <button onClick={() => handleEditClick(product)} className="flex items-center justify-center gap-2 text-sm bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 py-2 rounded-lg transition border border-teal-500/20">
                          <Edit2 size={16} /> Edit
                        </button>
                        <button onClick={() => handleDelete(product._id)} className="flex items-center justify-center gap-2 text-sm bg-red-500/10 hover:bg-red-500/20 text-red-400 py-2 rounded-lg transition border border-red-500/20">
                          <Trash2 size={16} /> Delete
                        </button>
                      </div>
                      <button onClick={() => handleStatusChange(product._id, 'pending_approval')} className="flex items-center justify-center gap-2 text-sm bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 w-full py-2 rounded-lg transition border border-blue-500/40 font-bold">
                        <RotateCcw size={16} /> Resubmit for Verification
                      </button>
                    </>
                  )}

                  {/* AVAILABLE STATE */}
                  {product.status === 'available' && (
                    <div className="grid grid-cols-2 gap-3">
                      <button onClick={() => handleStatusChange(product._id, 'removed')} className="flex items-center justify-center gap-2 text-sm bg-gray-500/10 hover:bg-gray-500/20 text-gray-400 py-2 rounded-lg transition border border-gray-500/20">
                        <EyeOff size={16} /> Remove
                      </button>
                      <button onClick={() => handleStatusChange(product._id, 'sold')} className="flex items-center justify-center gap-2 text-sm bg-green-500/20 hover:bg-green-500/30 text-green-400 py-2 rounded-lg transition border border-green-500/30 font-bold">
                        <CheckCircle2 size={16} /> Mark Purchased
                      </button>
                    </div>
                  )}

                  {/* SOLD STATE */}
                  {product.status === 'sold' && (
                    <div className="grid grid-cols-2 gap-3">
                      <button onClick={() => handleStatusChange(product._id, 'available')} className="flex items-center justify-center gap-2 text-sm bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 py-2 rounded-lg transition border border-teal-500/20">
                        <RotateCcw size={16} /> Mark Available
                      </button>
                      <button onClick={() => handleDelete(product._id)} className="flex items-center justify-center gap-2 text-sm bg-red-500/10 hover:bg-red-500/20 text-red-400 py-2 rounded-lg transition border border-red-500/20">
                        <Trash2 size={16} /> Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Edit Modal / Sidebar / Overlay */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-lg bg-[#050b0f] relative animate-fade-in shadow-[0_0_50px_rgba(0,0,0,0.8)] border-teal-500/30">
            <button onClick={() => setEditingProduct(null)} className="absolute top-4 right-4 text-teal-600 hover:text-teal-300">
              <X size={24} />
            </button>
            <h3 className="text-2xl font-bold text-teal-100 mb-6">Edit Listing</h3>
            
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-teal-500 text-sm mb-1">Title</label>
                <input type="text" name="title" required value={editForm.title} onChange={handleEditChange} className="glass-input" />
              </div>
              <div>
                <label className="block text-teal-500 text-sm mb-1">Description</label>
                <textarea name="description" required value={editForm.description} onChange={handleEditChange} className="glass-input" rows="3" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-teal-500 text-sm mb-1">Price (₹)</label>
                  <input type="number" name="price" required value={editForm.price} onChange={handleEditChange} className="glass-input" />
                </div>
                <div>
                  <label className="block text-teal-500 text-sm mb-1">Buying Date</label>
                  <input type="date" name="buyingDate" required value={editForm.buyingDate} onChange={handleEditChange} className="glass-input text-teal-100" />
                </div>
              </div>
              
              <button type="submit" className="glass-button flex items-center justify-center gap-2 mt-6">
                <Check size={20} /> Save Changes
              </button>
            </form>
          </div>
        </div>
      )}
      
    </div>
  );
};

export default Profile;
