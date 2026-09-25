import React from 'react';
import { PlexusCanvas } from './PlexusCanvas';

export const HeroSection: React.FC = () => {
  return (
    <section className="relative min-h-[92vh] flex items-center justify-center pt-28 pb-16 overflow-hidden bg-tone-dark">
      {/* 1. Low-opacity animated Plexus network background with mouse parallax */}
      <PlexusCanvas />

      {/* Radial depth glow behind hero title */}
      <div 
        className="absolute w-[600px] h-[600px] rounded-full pointer-events-none opacity-20 blur-[130px] z-0"
        style={{
          background: 'radial-gradient(circle, #3B82F6 0%, #5EEAD4 40%, transparent 70%)',
          top: '20%',
          left: '50%',
          transform: 'translateX(-50%)',
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
        {/* 3 Pill Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 mb-8 animate-fade-in">
          <div className="pill-badge border-blue-500/30 text-blue-200">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
            <span>State Safe (AES-256)</span>
          </div>
          <div className="pill-badge border-teal-500/30 text-teal-200">
            <span className="w-2 h-2 rounded-full bg-teal-400"></span>
            <span>Auto-Rehydration &lt; 42ms</span>
          </div>
          <div className="pill-badge border-purple-500/30 text-purple-200">
            <span className="w-2 h-2 rounded-full bg-purple-400"></span>
            <span>Zero-Downtime Deployments</span>
          </div>
        </div>

        {/* 2. Hero Title Reveal: Cinematic Entrance with Soft Blur, Drift, and Light Sweep */}
        <div className="cinematic-title mb-6">
          <h1 className="font-heading font-extrabold text-5xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tight leading-[1.08]">
            <span className="light-sweep-text block">
              Continuum Engine
            </span>
          </h1>
        </div>

        {/* Tagline */}
        <p className="font-heading text-xl sm:text-2xl md:text-3xl font-medium text-slate-300 max-w-3xl mb-6 tracking-tight leading-snug">
          Zero-Downtime Session Persistence for Modern SPAs
        </p>

        {/* Sub-description */}
        <p className="text-base sm:text-lg text-slate-400 max-w-2xl mb-10 leading-relaxed font-body">
          Intercepts dynamic chunk-load 404 errors during production releases, vaults live form progress with bank-grade AES-256 cryptography, and auto-rehydrates users after atomic bundle refresh — with <strong className="text-teal-300 font-semibold">zero data loss</strong>.
        </p>

        {/* Dual CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-16 w-full sm:w-auto">
          <a
            href="/app"
            className="btn-primary w-full sm:w-auto group relative overflow-hidden text-base"
          >
            <span>⚡ Launch Live MVP</span>
            <span className="text-xs bg-white/25 px-2 py-0.5 rounded font-mono font-bold tracking-wider">
              3D VAULT
            </span>
          </a>
          <a
            href="#problem"
            className="btn-secondary w-full sm:w-auto text-base"
          >
            <span>01 — Explore Architecture</span>
            <span>↓</span>
          </a>
        </div>

        {/* Hero Bottom Telemetry Ribbon */}
        <div className="w-full max-w-4xl grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 text-left">
          <div className="glass-panel p-4 flex flex-col justify-between">
            <span className="text-[11px] font-mono uppercase text-slate-400 tracking-wider">Resilience Rate</span>
            <div className="font-heading font-extrabold text-2xl sm:text-3xl text-teal-300 mt-1">99.99%</div>
            <span className="text-[11px] text-slate-400 mt-1">Zero uncommitted drop-offs</span>
          </div>
          <div className="glass-panel p-4 flex flex-col justify-between">
            <span className="text-[11px] font-mono uppercase text-slate-400 tracking-wider">Recovery Latency</span>
            <div className="font-heading font-extrabold text-2xl sm:text-3xl text-blue-400 mt-1">&lt; 42ms</div>
            <span className="text-[11px] text-slate-400 mt-1">Sub-second atomic rehydrate</span>
          </div>
          <div className="glass-panel p-4 flex flex-col justify-between">
            <span className="text-[11px] font-mono uppercase text-slate-400 tracking-wider">Encryption Standard</span>
            <div className="font-heading font-extrabold text-xl sm:text-2xl text-purple-300 mt-1">AES-256</div>
            <span className="text-[11px] text-slate-400 mt-1">Zero-plaintext envelope vault</span>
          </div>
          <div className="glass-panel p-4 flex flex-col justify-between">
            <span className="text-[11px] font-mono uppercase text-slate-400 tracking-wider">Form Accuracy</span>
            <div className="font-heading font-extrabold text-2xl sm:text-3xl text-emerald-400 mt-1">100%</div>
            <span className="text-[11px] text-slate-400 mt-1">Exact step & field restoration</span>
          </div>
        </div>
      </div>
    </section>
  );
};
