import React, { useState, useContext } from 'react';
import api from '../api/axiosInstance';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const SellProduct = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    buyingDate: ''
  });
  const [productPic, setProductPic] = useState(null);

  if(!user) return <div className="text-center mt-20 text-white">Please login first.</div>;

  const handleChange = (e) => {
    if (e.target.name === 'productPic') {
      setProductPic(e.target.files[0]);
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const dataPayload = new FormData();
      dataPayload.append('title', formData.title);
      dataPayload.append('description', formData.description);
      dataPayload.append('price', formData.price);
      dataPayload.append('buyingDate', formData.buyingDate);
      if (productPic) {
         dataPayload.append('productPic', productPic);
      }

      await api.post('/products/add', dataPayload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setSuccess('Product successfully submitted for Admin Verification! Once verified, it will be visible on the Marketplace.');
      setFormData({ title: '', description: '', price: '', buyingDate: ''});
      setProductPic(null);
      setTimeout(() => navigate('/products'), 3000);
    } catch (err) {
      if (err.response?.status === 401) {
         localStorage.removeItem('user');
         localStorage.removeItem('token');
         localStorage.removeItem('refreshToken');
         setError('Session expired. Please log in again.');
         setTimeout(() => { window.location.href = '/login'; }, 2000);
      } else {
         setError(err.response?.data?.message || 'Failed to submit product.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[70vh] w-full px-4 pt-10">
      <div className="glass-card w-full max-w-xl animate-fade-in relative z-10 p-8">
        <h2 className="text-3xl font-black text-center mb-2 tracking-tight text-teal-400 drop-shadow-[0_0_15px_rgba(0,210,255,0.4)]">Sell Your Product</h2>
        <p className="text-center text-teal-100/70 text-sm mb-6">List your item. It will go live after admin verification.</p>

        {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg mb-4 text-sm text-center font-medium backdrop-blur-sm shadow">{error}</div>}
        {success && <div className="bg-green-500/10 border border-green-500/30 text-green-400 p-3 rounded-lg mb-4 text-sm text-center font-medium backdrop-blur-sm shadow">{success}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-teal-500 text-sm mb-1 font-semibold">Product Title</label>
            <input type="text" name="title" required value={formData.title} onChange={handleChange} className="glass-input w-full" placeholder="e.g. Scientific Calculator" />
          </div>

          <div>
            <label className="block text-teal-500 text-sm mb-1 font-semibold">Description</label>
            <textarea name="description" required value={formData.description} onChange={handleChange} className="glass-input w-full" rows="3" placeholder="Condition, features, etc."></textarea>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-teal-500 text-sm mb-1 font-semibold">Selling Price (₹)</label>
              <input type="number" name="price" required value={formData.price} onChange={handleChange} className="glass-input w-full" placeholder="Price" />
            </div>
            <div>
              <label className="block text-teal-500 text-sm mb-1 font-semibold">Buying Date</label>
              <input type="date" name="buyingDate" required value={formData.buyingDate} onChange={handleChange} className="glass-input w-full text-teal-50" />
            </div>
          </div>

          <div>
            <label className="block text-teal-500 text-sm mb-1 font-semibold">Product Picture</label>
            <input type="file" name="productPic" accept="image/*" onChange={handleChange} className="glass-input w-full file:bg-teal-500/20 file:border file:border-teal-500/30 file:px-4 file:py-1.5 file:rounded-xl file:text-teal-300 file:mr-4 file:cursor-pointer hover:file:bg-teal-500/30 transition-all text-sm" />
          </div>

          <button type="submit" disabled={loading} className="glass-button w-full flex justify-center mt-6">
            {loading ? 'Submitting...' : 'Upload for Verification'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SellProduct;
