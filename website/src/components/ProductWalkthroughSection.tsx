import React, { useState } from 'react';
import { useScrollReveal } from './useScrollReveal';

export const ProductWalkthroughSection: React.FC = () => {
  const revealRef = useScrollReveal();
  const [activeCallout, setActiveCallout] = useState<number | null>(1);

  const callouts = [
    {
      id: 1,
      title: 'Page-Locked Progression Stepper',
      badge: 'Callout A',
      desc: 'Enforces strict step validation before allowing navigation to Step 4 (Review & Submit), preventing incomplete credit applications.',
    },
    {
      id: 2,
      title: 'Keystroke Autosave Pulse Indicator',
      badge: 'Callout B',
      desc: 'Real-time cyan pulse feedback (#00F0FF) whenever user inputs change, indicating immediate local state persistence & AES-256 vault readiness.',
    },
    {
      id: 3,
      title: 'Cryptographic Session HUD',
      badge: 'Callout C',
      desc: 'Displays the active HMAC-SHA256 session token, operational health badge, and real-time cluster synchronization metrics in the header bar.',
    },
    {
      id: 4,
      title: 'Chaos 404 Crash Simulator',
      badge: 'Callout D',
      desc: 'Embedded test utility in the navigation bar allowing operators and judges to simulate a production chunk failure with 1 click.',
    },
  ];

  return (
    <section className="py-24 bg-tone-slate border-t border-slate-800/80 relative">
      <div ref={revealRef} className="scroll-reveal max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center mb-16">
          <span className="section-tag">06 — PRODUCT WALKTHROUGH</span>
          <h2 className="section-title mb-4">
            Anatomy of a State Guardian SPA
          </h2>
          <p className="section-desc">
            Explore the UI engineering that powers Continuum Engine&apos;s zero-data-loss user experience and operator telemetry.
          </p>
        </div>

        {/* Mockup Canvas with Interactive Callouts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start mb-12">
          {/* Left: Callout Selector List */}
          <div className="flex flex-col gap-4">
            {callouts.map((c) => (
              <div
                key={c.id}
                onClick={() => setActiveCallout(c.id)}
                className={`glass-panel p-5 cursor-pointer transition-all duration-300 ${
                  activeCallout === c.id
                    ? 'border-teal-400 bg-teal-950/20 shadow-md shadow-teal-500/10 -translate-x-1'
                    : 'hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/30 text-teal-300">
                    {c.badge}
                  </span>
                  {activeCallout === c.id && (
                    <span className="text-teal-400 text-xs font-mono font-bold">● Active View</span>
                  )}
                </div>
                <h4 className="font-heading font-bold text-white text-base mb-1">
                  {c.title}
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed font-body">
                  {c.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Right: Realistic Application Mockup Shell */}
          <div className="lg:col-span-2 glass-panel p-4 sm:p-6 bg-[#060A12] border-slate-800 shadow-2xl">
            {/* Window Top Bar */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500/80"></span>
                <span className="w-3 h-3 rounded-full bg-yellow-500/80"></span>
                <span className="w-3 h-3 rounded-full bg-green-500/80"></span>
                <span className="text-xs font-mono text-slate-400 ml-2">
                  https://continuum-engine.onrender.com/app
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  OPERATIONAL
                </span>
              </div>
            </div>

            {/* Simulated Loan Wizard Card */}
            <div className="bg-[#0A0E1A] rounded-xl p-6 border border-slate-800 relative overflow-hidden">
              {/* Callout Indicator Overlays */}
              {activeCallout === 1 && (
                <div className="absolute top-2 left-6 bg-teal-500/10 border border-teal-400 text-teal-300 text-xs px-2.5 py-1 rounded-md animate-bounce font-mono z-20">
                  ▲ Callout A: Step Progress Locked
                </div>
              )}

              {/* Stepper Mockup */}
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-800/60">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-teal-400 text-slate-950 font-bold text-xs flex items-center justify-center">✓</div>
                  <span className="text-xs font-bold text-teal-300">1. Personal</span>
                </div>
                <div className="w-8 h-0.5 bg-teal-400/40"></div>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-teal-400 text-slate-950 font-bold text-xs flex items-center justify-center">✓</div>
                  <span className="text-xs font-bold text-teal-300">2. Financial</span>
                </div>
                <div className="w-8 h-0.5 bg-blue-500/40"></div>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-blue-500 text-white font-bold text-xs flex items-center justify-center ring-4 ring-blue-500/20">3</div>
                  <span className="text-xs font-bold text-white">3. Loan Options</span>
                </div>
                <div className="w-8 h-0.5 bg-slate-800"></div>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-slate-800 text-slate-500 font-bold text-xs flex items-center justify-center">4</div>
                  <span className="text-xs font-bold text-slate-500">4. Review</span>
                </div>
              </div>

              {/* Form Input Mockup */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="text-[11px] font-mono text-slate-400 block mb-1">
                    Requested Capital ($)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      readOnly
                      value="$50,000"
                      className="w-full bg-slate-900/90 border border-teal-500/40 rounded-lg px-3 py-2 text-sm text-teal-300 font-mono"
                    />
                    {activeCallout === 2 && (
                      <span className="absolute right-3 top-2.5 w-2.5 h-2.5 rounded-full bg-teal-400 animate-ping"></span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-mono text-slate-400 block mb-1">
                    Repayment Term
                  </label>
                  <input
                    type="text"
                    readOnly
                    value="36 Months (Fixed APR 4.2%)"
                    className="w-full bg-slate-900/90 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 font-mono"
                  />
                </div>
              </div>

              {/* Action Buttons Mockup */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-800/60">
                <button className="px-4 py-2 text-xs font-mono text-slate-400 bg-slate-900 border border-slate-800 rounded-lg">
                  ← Back to Step 2
                </button>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-[11px] font-mono text-teal-300">
                    <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
                    <span>AES-256 Vaulted</span>
                  </div>
                  <button className="px-5 py-2 text-xs font-heading font-bold text-white bg-blue-600 rounded-lg shadow-lg shadow-blue-600/30">
                    Proceed to Review →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
