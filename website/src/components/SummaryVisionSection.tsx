import React from 'react';
import { useScrollReveal } from './useScrollReveal';

export const SummaryVisionSection: React.FC = () => {
  const revealRef = useScrollReveal();

  const pillars = [
    {
      step: '01',
      title: 'INTERCEPT',
      subtitle: 'Zero White Screens',
      desc: 'Sub-millisecond trap on failed dynamic imports suppresses browser unhandled chunk exceptions before user notices.',
      color: 'from-blue-600/20 to-blue-900/10 border-blue-500/40 text-blue-400'
    },
    {
      step: '02',
      title: 'VAULT',
      subtitle: 'Zero Data Loss',
      desc: 'Hardware-accelerated AES-256-GCM cryptography packages active forms, routes, and tokens into an encrypted session snapshot.',
      color: 'from-amber-600/20 to-amber-900/10 border-amber-500/40 text-amber-400'
    },
    {
      step: '03',
      title: 'REHYDRATE',
      subtitle: 'Zero Friction',
      desc: 'Following atomic shell reload against the updated CDN manifest, state is deterministically unpacked and restored to the DOM.',
      color: 'from-emerald-600/20 to-emerald-900/10 border-emerald-500/40 text-emerald-400'
    }
  ];

  return (
    <section id="vision" className="relative py-28 px-4 sm:px-6 lg:px-8 bg-[#070A12] border-t border-slate-800/80">
      <div className="scroll-reveal max-w-6xl mx-auto" ref={revealRef}>
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/30 bg-blue-950/20 text-xs font-mono tracking-widest text-blue-300 uppercase mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
            16 — Summary & Engineering Vision
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
            Continuous Delivery Should Never Mean Continuous Abandonment
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-400 font-light leading-relaxed">
            Every day, engineering teams delay releases or dread mid-day deployments because stale asset caches cause client crashes. Continuum Engine permanently severs the compromise between developer velocity and user trust.
          </p>
        </div>

        {/* 3 Pillars Recap */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6">
          {pillars.map((p, idx) => (
            <div
              key={p.step}
              className={`glass-panel rounded-2xl p-7 border bg-gradient-to-b ${p.color} transition-all duration-500 hover:-translate-y-2`}
              style={{ transitionDelay: `${idx * 150}ms` }}
            >
              <div className="text-4xl font-mono font-black text-slate-700/60 mb-3">
                {p.step}
              </div>
              <h3 className="text-xl font-extrabold text-white tracking-wide">
                {p.title}
              </h3>
              <div className="text-xs font-mono font-semibold tracking-wider text-slate-300 mt-0.5 mb-3">
                {p.subtitle}
              </div>
              <p className="text-sm text-slate-400 leading-relaxed font-light">
                {p.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Vision Manifesto Callout */}
        <div className="mt-14 glass-panel rounded-3xl p-8 sm:p-10 border border-slate-800 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-teal-500/5 to-purple-600/10 pointer-events-none"></div>
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <div className="text-2xl sm:text-3xl font-extrabold text-white leading-snug">
              "The web was built to be resilient. Your single page applications should be too."
            </div>
            <p className="text-sm sm:text-base text-slate-400 font-light">
              By treating chunk load exceptions as an expected deployment artifact rather than an unrecoverable fatal crash, Continuum Engine provides the safety net required for true continuous deployment.
            </p>
            <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs font-mono text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                Zero Client Installs Required
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                SOC-2 Type II Compatible
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-teal-400"></span>
                Open Source & Self-Hostable
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
