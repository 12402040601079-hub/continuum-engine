import React, { useState, useEffect } from 'react';

export const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#0A0E17]/85 backdrop-blur-md border-b border-blue-500/15 py-3 shadow-2xl'
          : 'bg-transparent py-5'
      }`}
      style={{
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(16px)' : 'none',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo */}
        <a href="#" className="flex items-center gap-3 text-decoration-none group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-teal-400 p-[1px] shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-shadow">
            <div className="w-full h-full bg-[#0A0E17] rounded-[11px] flex items-center justify-center">
              <span className="text-xl">⚡</span>
            </div>
          </div>
          <div>
            <div className="font-heading font-extrabold text-lg text-white tracking-tight flex items-center gap-2">
              Continuum Engine
              <span className="text-[10px] uppercase font-mono font-bold px-1.5 py-0.5 rounded bg-blue-500/10 border border-blue-500/30 text-teal-300">
                v1.0.1
              </span>
            </div>
            <div className="text-[11px] font-mono text-slate-400 tracking-wider uppercase">
              Zero-Downtime State Guardian
            </div>
          </div>
        </a>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-slate-300">
          <a href="#problem" className="hover:text-teal-300 transition-colors">The Problem</a>
          <a href="#solution" className="hover:text-teal-300 transition-colors">Solution</a>
          <a href="#pathway" className="hover:text-teal-300 transition-colors">System Pathway</a>
          <a href="#demo" className="hover:text-teal-300 transition-colors">Live Simulation</a>
          <a href="#observability" className="hover:text-teal-300 transition-colors">Observability</a>
          <a href="#chaos" className="hover:text-teal-300 transition-colors">Chaos Lab</a>
          <a href="#architecture" className="hover:text-teal-300 transition-colors">Architecture</a>
          <a href="#methodology" className="hover:text-teal-300 transition-colors">Methodology</a>
        </nav>

        {/* Action Buttons */}
        <div className="hidden sm:flex items-center gap-3">
          <a
            href="/docs"
            className="px-4 py-2 text-xs font-mono font-semibold uppercase tracking-wider text-slate-300 hover:text-white bg-slate-900/60 hover:bg-slate-800/80 border border-slate-700/50 rounded-lg transition-all"
          >
            API Docs
          </a>
          <a
            href="/app"
            className="px-5 py-2.5 text-xs font-heading font-bold uppercase tracking-wider text-white bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-500 hover:to-teal-400 rounded-lg shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all flex items-center gap-2"
          >
            <span>⚡ Launch Live MVP</span>
            <span className="text-[10px] bg-white/20 px-1 rounded">3D</span>
          </a>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 rounded-lg bg-slate-800/50 border border-slate-700 text-slate-200"
          aria-label="Toggle Menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {mobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0A0E17]/95 border-b border-blue-500/20 px-4 pt-3 pb-6 flex flex-col gap-3 font-medium text-slate-200 mt-2 backdrop-blur-xl">
          <a href="#problem" onClick={() => setMobileMenuOpen(false)} className="py-2 border-b border-slate-800">The Problem</a>
          <a href="#solution" onClick={() => setMobileMenuOpen(false)} className="py-2 border-b border-slate-800">Solution</a>
          <a href="#pathway" onClick={() => setMobileMenuOpen(false)} className="py-2 border-b border-slate-800">System Pathway</a>
          <a href="#demo" onClick={() => setMobileMenuOpen(false)} className="py-2 border-b border-slate-800">Live Simulation</a>
          <a href="#observability" onClick={() => setMobileMenuOpen(false)} className="py-2 border-b border-slate-800">Observability</a>
          <a href="#chaos" onClick={() => setMobileMenuOpen(false)} className="py-2 border-b border-slate-800">Chaos Lab</a>
          <a href="#architecture" onClick={() => setMobileMenuOpen(false)} className="py-2 border-b border-slate-800">Architecture</a>
          <a href="#methodology" onClick={() => setMobileMenuOpen(false)} className="py-2 border-b border-slate-800">Methodology</a>
          <div className="flex gap-2 pt-2">
            <a href="/docs" className="flex-1 text-center py-2 text-xs font-mono uppercase bg-slate-800 rounded border border-slate-700">API Docs</a>
            <a href="/app" className="flex-1 text-center py-2 text-xs font-heading font-bold uppercase bg-blue-600 text-white rounded">Launch Live MVP</a>
          </div>
        </div>
      )}
    </header>
  );
};
