import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const PLACEHOLDER = 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&q=80';

export default function Shop() {
  const { addToCart, cart } = useCart();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filter, setFilter] = useState({ category: '', search: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [filter]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filter.category) params.category = filter.category;
      if (filter.search) params.search = filter.search;
      const { data } = await api.get('/products', { params });
      setProducts(data);
    } catch { toast.error('Failed to load products.'); }
    finally { setLoading(false); }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await api.get('/products/categories');
      setCategories(data);
    } catch {}
  };

  const inCart = (id) => cart.find(i => i.id === id);

  const handleAdd = (product) => {
    if (product.stock <= 0) { toast.error('Out of stock.'); return; }
    addToCart(product);
    toast.success(`${product.name} added to cart!`);
  };

  return (
    <div className="page-container">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="section-title mb-1">Hardware Shop</h1>
          <p className="text-white/50">Genuine parts & accessories</p>
        </div>
        <Link to="/cart" className="btn-secondary text-sm py-2 px-5 flex items-center gap-2 w-fit">
          🛒 View Cart {cart.length > 0 && <span className="bg-brand-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{cart.reduce((s, i) => s + i.qty, 0)}</span>}
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-8">
        <input className="input max-w-xs" placeholder="Search products…" value={filter.search}
          onChange={e => setFilter(p => ({ ...p, search: e.target.value }))} />
        <select className="input max-w-xs" value={filter.category}
          onChange={e => setFilter(p => ({ ...p, category: e.target.value }))}>
          <option value="">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {[...Array(8)].map((_, i) => <div key={i} className="skeleton h-64" />)}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 text-white/40">
          <div className="text-5xl mb-4">📦</div>
          <p>No products found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {products.map(p => (
            <div key={p.id} className="card flex flex-col hover:border-white/20 transition-all duration-300 group">
              <div className="aspect-[4/3] overflow-hidden bg-white/5">
                <img src={p.image_url || PLACEHOLDER} alt={p.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={e => { e.target.src = PLACEHOLDER; }} />
              </div>
              <div className="p-5 flex flex-col flex-1">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="text-white font-semibold text-sm leading-snug" style={{ fontFamily: 'Syne, sans-serif' }}>{p.name}</h3>
                </div>
                {p.brand && <p className="text-white/40 text-xs mb-2">{p.brand}</p>}
                <p className="text-white/50 text-xs leading-relaxed mb-4 flex-1 line-clamp-2">{p.description}</p>
                <div className="flex items-center justify-between mt-auto">
                  <div>
                    <div className="text-xl font-bold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>₹{p.price}</div>
                    <div className={`text-xs mt-0.5 ${p.stock > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {p.stock > 0 ? `${p.stock} in stock` : 'Out of stock'}
                    </div>
                  </div>
                  <button onClick={() => handleAdd(p)} disabled={p.stock <= 0}
                    className={`text-sm py-2 px-4 rounded-lg font-semibold transition-all ${inCart(p.id) ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'btn-primary'}`}>
                    {inCart(p.id) ? '✓ Added' : 'Add to Cart'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
