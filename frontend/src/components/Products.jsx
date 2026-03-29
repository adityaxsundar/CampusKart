import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ShoppingBag, Calendar, User } from 'lucide-react';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/products');
        if (res.data.success) {
          setProducts(res.data.data);
        } else {
          setError('Failed to fetch products');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Error fetching products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="flex flex-col items-center justify-start min-h-[50vh] animate-fade-in text-center px-4 w-full pt-10">
      <h1 className="text-4xl font-bold text-[#ffa498] mb-4 drop-shadow-lg flex items-center gap-3">
        <ShoppingBag size={36} /> Marketplace
      </h1>
      <p className="text-gray-300 max-w-lg mb-8">
        Explore fixed-price products listed strictly by verified IITP students. More features coming soon!
      </p>

      {loading ? (
        <div className="text-white text-xl animate-pulse">Loading products...</div>
      ) : error ? (
        <div className="text-red-400 text-lg bg-red-900 bg-opacity-20 px-6 py-3 rounded-lg border border-red-500">{error}</div>
      ) : products.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl mt-8">
          <div className="glass-card flex items-center justify-center h-48 bg-[#111] bg-opacity-90 col-span-full">
            <span className="opacity-50 text-xl font-medium">No Products Found</span>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 w-full max-w-7xl mt-8 pb-12">
          {products.map((product) => (
            <div key={product._id} className="glass-card overflow-hidden flex flex-col items-start text-left bg-[#1a1a24] hover:scale-105 transition-transform duration-300 shadow-xl border border-gray-700 hover:border-blue-500">
              <div className="w-full h-56 bg-gray-800 relative">
                {product.productPic ? (
                  <img src={product.productPic} alt={product.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500">No Image provided</div>
                )}
                <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                  Verified
                </div>
              </div>

              <div className="p-5 flex flex-col flex-grow w-full">
                <h3 className="text-xl font-bold text-white mb-2 line-clamp-1" title={product.title}>{product.title}</h3>
                <p className="text-gray-400 text-sm mb-4 line-clamp-2" title={product.description}>{product.description}</p>

                <div className="mt-auto">
                  <div className="flex items-center text-green-400 font-extrabold text-2xl mb-3">
                    ₹{product.price}
                  </div>

                  <div className="text-xs text-gray-400 flex flex-col gap-1.5 border-t border-gray-700 pt-3">
                    {product.seller && (
                      <div className="flex items-center gap-1.5">
                        <User size={14} className="text-gray-500" />
                        <span>Seller: <span className="text-gray-300 font-medium">{product.seller.name}</span></span>
                      </div>
                    )}
                    {product.buyingDate && (
                      <div className="flex items-center gap-1.5">
                        <Calendar size={14} className="text-gray-500" />
                        <span>Bought: {new Date(product.buyingDate).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  {/* Later feature: Start a chat or buy logic */}
                  <button className="w-full mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-2 rounded-lg transition-colors shadow-md">
                    Contact Seller
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Products;
