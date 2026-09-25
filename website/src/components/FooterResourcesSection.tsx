import React from 'react';
import { useScrollReveal } from './useScrollReveal';

export const FooterResourcesSection: React.FC = () => {
  const revealRef = useScrollReveal();

  return (
    <footer id="resources" className="relative pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-[#05070D] border-t border-slate-800">
      <div className="scroll-reveal max-w-7xl mx-auto" ref={revealRef}>
        {/* Massive Dual CTA Card */}
        <div className="glass-panel rounded-3xl p-8 sm:p-12 lg:p-16 border border-blue-500/30 bg-gradient-to-br from-blue-950/30 via-slate-900/50 to-teal-950/20 relative overflow-hidden mb-20">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-teal-500/30 bg-teal-950/30 text-xs font-mono tracking-widest text-teal-300 uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse"></span>
              17 — Ready to Experience Continuum?
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              Test Zero-Downtime Session Persistence Right Now
            </h2>

            <p className="text-base sm:text-lg text-slate-300 font-light leading-relaxed">
              Step into the live 3D loan underwriter application, trigger real-time chunk invalidations with simulated deployment purges, and watch state rehydrate seamlessly.
            </p>

            {/* Action Buttons */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="/app"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-base shadow-xl shadow-blue-600/30 transition-all hover:scale-105 active:scale-95"
              >
                <svg className="w-5 h-5 text-teal-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Launch Live MVP Demo
              </a>

              <a
                href="/docs"
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl glass-panel text-white font-semibold text-base hover:bg-slate-800/80 border border-slate-700 hover:border-slate-500 transition-all hover:scale-105 active:scale-95"
              >
                <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                FastAPI Swagger API Specs
              </a>
            </div>

            {/* Quick Metrics */}
            <div className="pt-6 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs font-mono text-slate-400 border-t border-slate-800/80">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>Latency: &lt; 15ms</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                <span>Cipher: AES-256-GCM</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                <span>Data Loss: 0.00%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Navigation Columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pb-16 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-teal-400 flex items-center justify-center font-mono font-black text-black text-sm">
                CE
              </div>
              <span className="text-white font-bold tracking-tight text-base">Continuum Engine</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed font-light mb-4">
              Zero-downtime session persistence for single-page applications. Intercept chunk 404s, vault client state, and rehydrate seamlessly.
            </p>
            <div className="text-xs font-mono text-slate-500">
              v2.4.0-championship · MIT License
            </div>
          </div>

          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold mb-3">
              Architecture
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><a href="#core-problem" className="hover:text-blue-400 transition-colors">02 — The Core Problem</a></li>
              <li><a href="#solution" className="hover:text-blue-400 transition-colors">04 — 3-Step Flow</a></li>
              <li><a href="#pathway" className="hover:text-blue-400 transition-colors">05 — System Pathway</a></li>
              <li><a href="#data-arch" className="hover:text-blue-400 transition-colors">12 — Data Architecture</a></li>
              <li><a href="#tech-stack" className="hover:text-blue-400 transition-colors">13 — Technology Stack</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold mb-3">
              Validation & Lab
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><a href="#impact" className="hover:text-blue-400 transition-colors">03 — Real-World Impact</a></li>
              <li><a href="#demo" className="hover:text-blue-400 transition-colors">07 — Animated Demo</a></li>
              <li><a href="#observability" className="hover:text-blue-400 transition-colors">09 — Live Crash Telemetry</a></li>
              <li><a href="#chaos" className="hover:text-blue-400 transition-colors">11 — Chaos Lab</a></li>
              <li><a href="#methodology" className="hover:text-blue-400 transition-colors">15 — 17-Step Methodology</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold mb-3">
              Live Operations
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><a href="/app" className="hover:text-blue-400 transition-colors">⚡ Live MVP Wizard App</a></li>
              <li><a href="/docs" target="_blank" rel="noreferrer" className="hover:text-blue-400 transition-colors">📖 OpenAPI Swagger Docs</a></li>
              <li><a href="#operations" className="hover:text-blue-400 transition-colors">10 — Cluster Health Dashboard</a></li>
              <li><a href="#testing" className="hover:text-blue-400 transition-colors">14 — Pytest 27/27 Pyramid</a></li>
              <li><a href="#vision" className="hover:text-blue-400 transition-colors">16 — Summary & Vision</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Credits & Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-500">
          <div>
            © 2026 Continuum Engine. Built for Unstop Hackathon 2026.
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <span>Solo Architect & Developer:</span>
            <span className="text-teal-300 font-semibold">Sneh Shukal</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
