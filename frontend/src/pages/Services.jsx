import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  pending: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  confirmed: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  in_progress: 'bg-brand-500/15 text-brand-500 border-brand-500/30',
  completed: 'bg-green-500/15 text-green-400 border-green-500/30',
  cancelled: 'bg-red-500/15 text-red-400 border-red-500/30',
};

const TIMES = ['9:00 AM','10:00 AM','11:00 AM','12:00 PM','1:00 PM','2:00 PM','3:00 PM','4:00 PM','5:00 PM'];

export default function Services() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ device_name: '', device_issue: '', booking_date: '', booking_time: '', notes: '' });

  useEffect(() => {
    fetchServices();
    if (user) fetchBookings();
  }, [user]);

  const fetchServices = async () => {
    try {
      const { data } = await api.get('/services');
      setServices(data);
    } catch { toast.error('Failed to load services.'); }
    finally { setLoading(false); }
  };

  const fetchBookings = async () => {
    try {
      const { data } = await api.get('/services/bookings');
      setBookings(data);
    } catch {}
  };

  const handleBook = (service) => {
    if (!user) { navigate('/login'); return; }
    setSelected(service);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/services/book', { service_type_id: selected.id, ...form });
      toast.success('Booking confirmed! Check your email.');
      setShowForm(false);
      setForm({ device_name: '', device_issue: '', booking_date: '', booking_time: '', notes: '' });
      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed.');
    } finally { setSubmitting(false); }
  };

  const cancelBooking = async (id) => {
    if (!confirm('Cancel this booking?')) return;
    try {
      await api.delete(`/services/bookings/${id}`);
      toast.success('Booking cancelled.');
      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel.');
    }
  };

  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <div className="page-container">
      {/* Booking Form Modal */}
      {showForm && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="card w-full max-w-lg p-8 fade-up">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>Book: {selected.name}</h2>
                <p className="text-brand-500 font-semibold">₹{selected.price}</p>
              </div>
              <button onClick={() => setShowForm(false)} className="text-white/40 hover:text-white text-2xl">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Device name</label>
                <input className="input" placeholder="e.g. Dell Inspiron 15 3511" value={form.device_name}
                  onChange={e => setForm(p => ({ ...p, device_name: e.target.value }))} required />
              </div>
              <div>
                <label className="label">Describe the issue</label>
                <textarea className="input resize-none" rows={3} placeholder="What's wrong with your device?" value={form.device_issue}
                  onChange={e => setForm(p => ({ ...p, device_issue: e.target.value }))} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Preferred date</label>
                  <input type="date" className="input" min={minDate} value={form.booking_date}
                    onChange={e => setForm(p => ({ ...p, booking_date: e.target.value }))} required />
                </div>
                <div>
                  <label className="label">Time slot</label>
                  <select className="input" value={form.booking_time}
                    onChange={e => setForm(p => ({ ...p, booking_time: e.target.value }))} required>
                    <option value="">Select time</option>
                    {TIMES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="label">Additional notes <span className="text-white/30">(optional)</span></label>
                <input className="input" placeholder="Any extra info…" value={form.notes}
                  onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
              </div>
              <button type="submit" className="btn-primary w-full py-3.5" disabled={submitting}>
                {submitting ? 'Booking…' : `Confirm Booking — ₹${selected.price}`}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Services List */}
      <div className="mb-12">
        <h1 className="section-title mb-2">Repair Services</h1>
        <p className="text-white/50">Professional hardware repairs — fast, reliable, and warranted</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => <div key={i} className="skeleton h-48" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map(s => (
            <div key={s.id} className="card p-6 flex flex-col hover:border-white/20 transition-all duration-300">
              <div className="flex-1">
                <h3 className="text-white font-bold text-lg mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>{s.name}</h3>
                <p className="text-white/50 text-sm leading-relaxed mb-4">{s.description}</p>
                <div className="flex items-center gap-4 text-sm text-white/40 mb-5">
                  <span>⏱ ~{s.duration_hours}hr turnaround</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-brand-500" style={{ fontFamily: 'Syne, sans-serif' }}>₹{s.price}</span>
                <button onClick={() => handleBook(s)} className="btn-primary text-sm py-2 px-5">Book Now</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* My Bookings */}
      {user && bookings.length > 0 && (
        <div className="mt-16">
          <h2 className="section-title mb-6">My Bookings</h2>
          <div className="space-y-4">
            {bookings.map(b => (
              <div key={b.id} className="card p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-semibold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>{b.service_name}</span>
                    <span className={`badge border ${STATUS_COLORS[b.status] || 'bg-white/10 text-white/60'}`}>{b.status.replace('_', ' ')}</span>
                  </div>
                  <p className="text-white/50 text-sm">{b.device_name} · {b.booking_date} at {b.booking_time}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-brand-500 font-bold">₹{b.total_price}</span>
                  {!['completed', 'cancelled'].includes(b.status) && (
                    <button onClick={() => cancelBooking(b.id)} className="btn-danger">Cancel</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
