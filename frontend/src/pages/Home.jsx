import { Link } from 'react-router-dom';

const services = [
  { icon: '🔧', title: 'Parts Replacement', desc: 'RAM, HDD, keyboard, screen & more' },
  { icon: '💿', title: 'OS Installation', desc: 'Windows, Linux, macOS & more' },
  { icon: '🛡️', title: 'Virus Removal', desc: 'Deep scan & security hardening' },
  { icon: '📱', title: 'Screen Repair', desc: 'Laptop, phone & tablet screens' },
  { icon: '💾', title: 'Data Recovery', desc: 'Recover lost files & drives' },
  { icon: '⚡', title: 'Performance Boost', desc: 'SSD, RAM & thermal upgrades' },
];

const stats = [
  { value: '5,000+', label: 'Repairs Done' },
  { value: '4.9★', label: 'Average Rating' },
  { value: '24hr', label: 'Fast Turnaround' },
  { value: '1 Year', label: 'Warranty' },
];

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-500/10 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-20 right-0 w-96 h-96 bg-brand-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="page-container pt-20 pb-24 fade-up">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-brand-500/15 border border-brand-500/30 text-brand-500 text-sm font-semibold px-4 py-1.5 rounded-full mb-6" style={{ fontFamily: 'Syne, sans-serif' }}>
              <span className="w-2 h-2 bg-brand-500 rounded-full animate-pulse" />
              Vijayawada's Trusted Repair Hub
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-[1.05] mb-6" style={{ fontFamily: 'Syne, sans-serif' }}>
              Fix Fast.<br /><span className="text-brand-500">Buy Smart.</span>
            </h1>
            <p className="text-lg text-white/60 mb-10 max-w-xl leading-relaxed">
              Professional hardware repairs, OS installations, and genuine spare parts — all in one place. Book a service or shop components today.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/services" className="btn-primary text-base px-8 py-3.5">Book a Repair</Link>
              <Link to="/shop" className="btn-secondary text-base px-8 py-3.5">Shop Parts</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-white/10 bg-white/[0.02]">
        <div className="page-container py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl font-extrabold text-white mb-1" style={{ fontFamily: 'Syne, sans-serif' }}>{s.value}</div>
                <div className="text-sm text-white/40">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="page-container py-20">
        <div className="text-center mb-12">
          <h2 className="section-title mb-3">What We Fix</h2>
          <p className="text-white/50">Expert repairs for all your hardware needs</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((s, i) => (
            <div key={i} className="card p-6 group hover:border-brand-500/30 transition-all duration-300 hover:-translate-y-1">
              <div className="text-3xl mb-4">{s.icon}</div>
              <h3 className="text-white font-semibold text-lg mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>{s.title}</h3>
              <p className="text-white/50 text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
        <div className="text-center mt-10">
          <Link to="/services" className="btn-primary px-8 py-3">View All Services & Prices</Link>
        </div>
      </section>

      {/* CTA */}
      <section className="page-container pb-20">
        <div className="card bg-gradient-to-br from-brand-500/20 to-brand-700/10 border-brand-500/30 p-10 text-center">
          <h2 className="text-3xl font-bold text-white mb-4" style={{ fontFamily: 'Syne, sans-serif' }}>Need a Part? We Stock It.</h2>
          <p className="text-white/60 mb-8 max-w-lg mx-auto">From RAM and SSDs to cables and coolers — browse our full catalog of genuine hardware components.</p>
          <Link to="/shop" className="btn-primary px-8 py-3.5 text-base">Browse the Shop</Link>
        </div>
      </section>
    </div>
  );
}
