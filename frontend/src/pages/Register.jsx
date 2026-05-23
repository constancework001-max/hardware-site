import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters.'); return; }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.phone);
      toast.success('Account created! Welcome!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const f = (key) => ({ value: form[key], onChange: e => setForm(p => ({ ...p, [key]: e.target.value })) });

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md fade-up">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Create account</h1>
          <p className="text-white/50">Join TechFix Pro for repairs & parts</p>
        </div>
        <form onSubmit={handleSubmit} className="card p-8 space-y-5">
          <div>
            <label className="label">Full name</label>
            <input type="text" className="input" placeholder="Ravi Kumar" {...f('name')} required />
          </div>
          <div>
            <label className="label">Email address</label>
            <input type="email" className="input" placeholder="you@example.com" {...f('email')} required />
          </div>
          <div>
            <label className="label">Phone number <span className="text-white/30">(optional)</span></label>
            <input type="tel" className="input" placeholder="+91 98765 43210" {...f('phone')} />
          </div>
          <div>
            <label className="label">Password</label>
            <input type="password" className="input" placeholder="Min. 6 characters" {...f('password')} required />
          </div>
          <button type="submit" className="btn-primary w-full py-3.5" disabled={loading}>
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
          <p className="text-center text-white/50 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-500 hover:text-brand-400 font-medium">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
