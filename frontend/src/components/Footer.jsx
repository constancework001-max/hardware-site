import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#0a0a0a] mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 bg-brand-500 rounded-lg flex items-center justify-center">
                <svg width="14" height="14" fill="white" viewBox="0 0 24 24"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/></svg>
              </div>
              <span className="font-bold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>TechFix<span className="text-brand-500">Pro</span></span>
            </div>
            <p className="text-white/40 text-sm leading-relaxed max-w-xs">
              Hyderabad's trusted hardware repair shop. Genuine parts, expert repairs, and real warranties.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold text-sm mb-4" style={{ fontFamily: 'Syne, sans-serif' }}>Services</h4>
            <ul className="space-y-2 text-sm text-white/40">
              {['Parts Replacement', 'OS Installation', 'Virus Removal', 'Screen Repair', 'Data Recovery'].map(s => (
                <li key={s}><Link to="/services" className="hover:text-white/70 transition-colors">{s}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold text-sm mb-4" style={{ fontFamily: 'Syne, sans-serif' }}>Account</h4>
            <ul className="space-y-2 text-sm text-white/40">
              {[['Login', '/login'], ['Register', '/register'], ['Dashboard', '/dashboard'], ['Shop', '/shop']].map(([l, to]) => (
                <li key={l}><Link to={to} className="hover:text-white/70 transition-colors">{l}</Link></li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-white/30 text-xs">
          <p>© 2025 TechFix Pro. All rights reserved.</p>
          <p>📍 Hyderabad, Telangana · 📞 +91 98765 43210</p>
        </div>
      </div>
    </footer>
  );
}
