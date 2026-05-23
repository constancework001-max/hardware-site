import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function Cart() {
  const { cart, removeFromCart, updateQty, clearCart, total } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [address, setAddress] = useState(user?.address || '');
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    if (!user) { navigate('/login'); return; }
    if (!address.trim()) { toast.error('Please enter a shipping address.'); return; }
    setLoading(true);
    try {
      // 1. Create order in DB
      const { data: order } = await api.post('/orders', {
        items: cart.map(i => ({ product_id: i.id, quantity: i.qty })),
        shipping_address: address
      });

      // 2. Create Razorpay payment order
      const { data: rzp } = await api.post('/payments/create-order', {
        amount: total,
        receipt: `order_${order.id}`
      });

      // 3. Open Razorpay checkout
      const options = {
        key: rzp.key,
        amount: rzp.amount,
        currency: rzp.currency,
        name: 'TechFix Pro',
        description: 'Hardware Parts Order',
        order_id: rzp.orderId,
        handler: async (response) => {
          try {
            await api.post('/payments/verify', {
              ...response,
              type: 'order',
              reference_id: order.id
            });
            clearCart();
            toast.success('Order placed successfully! 🎉');
            navigate('/dashboard');
          } catch {
            toast.error('Payment verification failed. Contact support.');
          }
        },
        prefill: { name: user.name, email: user.email, contact: user.phone || '' },
        theme: { color: '#f97316' },
        modal: { ondismiss: () => { setLoading(false); } }
      };
      const rzpWindow = new window.Razorpay(options);
      rzpWindow.open();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Checkout failed.');
      setLoading(false);
    }
  };

  if (cart.length === 0) return (
    <div className="page-container text-center py-24">
      <div className="text-6xl mb-6">🛒</div>
      <h2 className="text-2xl font-bold text-white mb-3" style={{ fontFamily: 'Syne, sans-serif' }}>Your cart is empty</h2>
      <p className="text-white/50 mb-8">Add some hardware parts to get started.</p>
      <Link to="/shop" className="btn-primary px-8 py-3">Browse Shop</Link>
    </div>
  );

  return (
    <div className="page-container">
      <h1 className="section-title mb-8">Your Cart</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map(item => (
            <div key={item.id} className="card p-5 flex items-center gap-5">
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-white/5 flex-shrink-0">
                <img src={item.image_url || 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=200&q=80'}
                  alt={item.name} className="w-full h-full object-cover"
                  onError={e => { e.target.src = 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=200&q=80'; }} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-semibold text-sm truncate" style={{ fontFamily: 'Syne, sans-serif' }}>{item.name}</h3>
                <p className="text-white/40 text-xs">{item.brand}</p>
                <p className="text-brand-500 font-bold mt-1">₹{item.price} × {item.qty} = ₹{(item.price * item.qty).toFixed(2)}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => updateQty(item.id, item.qty - 1)} className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center justify-center">−</button>
                <span className="w-8 text-center text-white font-semibold">{item.qty}</span>
                <button onClick={() => updateQty(item.id, item.qty + 1)} disabled={item.qty >= item.stock}
                  className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center justify-center disabled:opacity-30">+</button>
                <button onClick={() => removeFromCart(item.id)} className="ml-2 text-red-400 hover:text-red-300 text-sm transition-colors">✕</button>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="card p-6 h-fit space-y-5">
          <h2 className="text-lg font-bold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>Order Summary</h2>
          <div className="space-y-2 text-sm">
            {cart.map(i => (
              <div key={i.id} className="flex justify-between text-white/60">
                <span className="truncate pr-2">{i.name} ×{i.qty}</span>
                <span className="flex-shrink-0">₹{(i.price * i.qty).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-white/10 pt-4 flex justify-between text-white font-bold text-lg">
            <span>Total</span>
            <span className="text-brand-500">₹{total.toFixed(2)}</span>
          </div>
          <div>
            <label className="label">Shipping address</label>
            <textarea className="input resize-none" rows={3} placeholder="Full address with city and pincode…"
              value={address} onChange={e => setAddress(e.target.value)} />
          </div>
          {!user && (
            <p className="text-yellow-400 text-sm bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
              Please <Link to="/login" className="underline">login</Link> to checkout.
            </p>
          )}
          <button onClick={handleCheckout} className="btn-primary w-full py-3.5" disabled={loading}>
            {loading ? 'Processing…' : 'Pay with Razorpay'}
          </button>
          <p className="text-white/30 text-xs text-center">Secured by Razorpay. Free delivery on orders over ₹999.</p>
        </div>
      </div>
    </div>
  );
}
