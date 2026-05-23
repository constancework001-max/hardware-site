import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  pending:    'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  confirmed:  'bg-blue-500/15 text-blue-400 border-blue-500/30',
  in_progress:'bg-brand-500/15 text-brand-500 border-brand-500/30',
  completed:  'bg-green-500/15 text-green-400 border-green-500/30',
  cancelled:  'bg-red-500/15 text-red-400 border-red-500/30',
  shipped:    'bg-purple-500/15 text-purple-400 border-purple-500/30',
  delivered:  'bg-green-500/15 text-green-400 border-green-500/30',
  paid:       'bg-green-500/15 text-green-400',
  unpaid:     'bg-red-500/15 text-red-400',
};

export default function Dashboard() {
  const { user, updateUser } = useAuth();
  const [tab, setTab] = useState('bookings');
  const [bookings, setBookings] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({ name: user?.name || '', phone: user?.phone || '', address: user?.address || '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [bRes, oRes] = await Promise.all([api.get('/services/bookings'), api.get('/orders')]);
      setBookings(bRes.data);
      setOrders(oRes.data);
    } catch { toast.error('Failed to load data.'); }
    finally { setLoading(false); }
  };

  const cancelBooking = async (id) => {
    if (!confirm('Cancel this booking?')) return;
    try {
      await api.delete(`/services/bookings/${id}`);
      toast.success('Booking cancelled.');
      fetchAll();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed.'); }
  };

  const cancelOrder = async (id) => {
    if (!confirm('Cancel this order?')) return;
    try {
      await api.delete(`/orders/${id}`);
      toast.success('Order cancelled.');
      fetchAll();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed.'); }
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put('/auth/profile', profile);
      updateUser(data);
      toast.success('Profile updated!');
    } catch { toast.error('Failed to update profile.'); }
    finally { setSaving(false); }
  };

  const tabs = [
    { id: 'bookings', label: `Bookings (${bookings.length})` },
    { id: 'orders', label: `Orders (${orders.length})` },
    { id: 'profile', label: 'Profile' },
  ];

  return (
    <div className="page-container">
      <div className="mb-8">
        <h1 className="section-title mb-1">My Dashboard</h1>
        <p className="text-white/50">Welcome back, {user?.name}!</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 border-b border-white/10 pb-0">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-5 py-2.5 text-sm font-semibold border-b-2 transition-all -mb-px ${tab === t.id ? 'border-brand-500 text-brand-500' : 'border-transparent text-white/50 hover:text-white'}`}
            style={{ fontFamily: 'Syne, sans-serif' }}>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="skeleton h-20" />)}</div>
      ) : (
        <>
          {/* Bookings Tab */}
          {tab === 'bookings' && (
            <div className="space-y-4">
              {bookings.length === 0 ? (
                <div className="text-center py-16 text-white/40">
                  <div className="text-4xl mb-3">🔧</div>
                  <p>No repair bookings yet.</p>
                </div>
              ) : bookings.map(b => (
                <div key={b.id} className="card p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-white font-semibold" style={{ fontFamily: 'Syne, sans-serif' }}>{b.service_name}</span>
                        <span className={`badge border text-xs ${STATUS_COLORS[b.status] || ''}`}>{b.status.replace('_', ' ')}</span>
                        <span className={`badge text-xs ${STATUS_COLORS[b.payment_status] || ''}`}>{b.payment_status}</span>
                      </div>
                      <p className="text-white/50 text-sm">{b.device_name} · {b.device_issue?.slice(0, 60)}{b.device_issue?.length > 60 ? '…' : ''}</p>
                      <p className="text-white/30 text-xs mt-1">{b.booking_date} at {b.booking_time} · Booked {new Date(b.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-4 flex-shrink-0">
                      <span className="text-brand-500 font-bold">₹{b.total_price}</span>
                      {!['completed', 'cancelled'].includes(b.status) && (
                        <button onClick={() => cancelBooking(b.id)} className="btn-danger">Cancel</button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Orders Tab */}
          {tab === 'orders' && (
            <div className="space-y-4">
              {orders.length === 0 ? (
                <div className="text-center py-16 text-white/40">
                  <div className="text-4xl mb-3">📦</div>
                  <p>No orders yet.</p>
                </div>
              ) : orders.map(o => (
                <div key={o.id} className="card p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-white font-semibold" style={{ fontFamily: 'Syne, sans-serif' }}>Order #{o.id}</span>
                        <span className={`badge border text-xs ${STATUS_COLORS[o.status] || ''}`}>{o.status}</span>
                        <span className={`badge text-xs ${STATUS_COLORS[o.payment_status] || ''}`}>{o.payment_status}</span>
                      </div>
                      {o.items?.map((item, i) => (
                        <p key={i} className="text-white/50 text-sm">{item.name} × {item.quantity} — ₹{item.price}</p>
                      ))}
                      <p className="text-white/30 text-xs mt-2">{new Date(o.created_at).toLocaleDateString()} · {o.shipping_address?.slice(0, 60)}</p>
                    </div>
                    <div className="flex items-center gap-4 flex-shrink-0">
                      <span className="text-brand-500 font-bold text-lg">₹{o.total_amount}</span>
                      {!['shipped', 'delivered', 'cancelled'].includes(o.status) && (
                        <button onClick={() => cancelOrder(o.id)} className="btn-danger">Cancel</button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Profile Tab */}
          {tab === 'profile' && (
            <form onSubmit={saveProfile} className="card p-8 max-w-lg space-y-5">
              <h2 className="text-xl font-bold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>Edit Profile</h2>
              <div>
                <label className="label">Full name</label>
                <input className="input" value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} required />
              </div>
              <div>
                <label className="label">Email</label>
                <input className="input opacity-50 cursor-not-allowed" value={user?.email} disabled />
              </div>
              <div>
                <label className="label">Phone</label>
                <input className="input" value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} placeholder="+91 98765 43210" />
              </div>
              <div>
                <label className="label">Default address</label>
                <textarea className="input resize-none" rows={3} value={profile.address}
                  onChange={e => setProfile(p => ({ ...p, address: e.target.value }))} placeholder="Your delivery address" />
              </div>
              <button type="submit" className="btn-primary px-8 py-3" disabled={saving}>
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </form>
          )}
        </>
      )}
    </div>
  );
}
