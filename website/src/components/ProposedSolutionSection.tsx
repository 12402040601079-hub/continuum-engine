import React, { useState } from 'react';
import { useScrollReveal } from './useScrollReveal';

export const ProposedSolutionSection: React.FC = () => {
  const revealRef = useScrollReveal();
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      num: '01',
      title: 'Intercept',
      tag: 'StaleAssetBoundary',
      timing: '&lt; 12ms',
      color: 'border-blue-500/40 text-blue-400',
      bgGlow: 'from-blue-600/20 to-transparent',
      desc: 'Wraps dynamic lazy-routes and network asset fetchers. Catches 404 ChunkLoadErrors and CDN network exceptions before they bubble up to crash the React/SPA render tree.',
      technical: 'Catches window.onerror & dynamic import() rejection, prevents white screen, freezes UI interaction during recovery snapshot.',
    },
    {
      num: '02',
      title: 'Vault',
      tag: 'AES-256 Envelope Cipher',
      timing: '&lt; 28ms',
      color: 'border-teal-500/40 text-teal-300',
      bgGlow: 'from-teal-600/20 to-transparent',
      desc: 'Serializes active form progress, active stepper index, and session JWT into an ephemeral snapshot. Encrypts payload with bank-grade AES-256-CBC and vaults to MongoDB cluster.',
      technical: 'Zero-plaintext architecture, HMAC-SHA256 session token signature, ephemeral 15-minute TTL auto-purge.',
    },
    {
      num: '03',
      title: 'Rehydrate',
      tag: 'Atomic Cache-Bust Reload',
      timing: '&lt; 38ms (MTTR)',
      color: 'border-emerald-500/40 text-emerald-400',
      bgGlow: 'from-emerald-600/20 to-transparent',
      desc: 'Triggers hard cache-busting reload to fetch the newly deployed JS/Dart bundle. Initializes StaleAssetBoundary, decrypts the session vault, and restores 100% of user inputs with exact step precision.',
      technical: 'Monotonic anti-loop latch prevents infinite reloads if chunk is genuinely broken. Instant cyber-audio chime feedback.',
    },
  ];

  return (
    <section id="solution" className="py-24 bg-tone-dark border-t border-slate-800/80 relative">
      <div ref={revealRef} className="scroll-reveal max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center mb-16">
          <span className="section-tag">04 — THE CONTINUUM SOLUTION</span>
          <h2 className="section-title mb-4">
            The 3-Step Zero-Data-Loss Lifecycle
          </h2>
          <p className="section-desc">
            A hardened, non-blocking resilience protocol engineered specifically for client-side SPAs operating in continuous deployment environments.
          </p>
        </div>

        {/* 3 Step Interactive Architecture Grid */}
        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {/* Self-Drawing Connecting SVG Arrows on Desktop */}
          <div className="hidden md:block absolute top-1/2 left-0 right-0 -translate-y-12 pointer-events-none z-0 px-16">
            <svg className="w-full h-12" preserveAspectRatio="none" viewBox="0 0 1000 60">
              <path
                d="M 280 30 L 390 30 M 620 30 L 730 30"
                stroke="#3B82F6"
                strokeWidth="2"
                strokeDasharray="6 6"
                fill="none"
                className="opacity-40"
              />
              <circle cx="390" cy="30" r="4" fill="#5EEAD4" />
              <circle cx="730" cy="30" r="4" fill="#5EEAD4" />
            </svg>
          </div>

          {steps.map((step, idx) => (
            <div
              key={step.num}
              onClick={() => setActiveStep(idx)}
              className={`glass-panel p-8 relative cursor-pointer z-10 transition-all duration-300 ${
                activeStep === idx
                  ? `${step.color} shadow-xl shadow-blue-500/10 -translate-y-2`
                  : 'hover:border-slate-700'
              }`}
            >
              {/* Step Header */}
              <div className="flex items-center justify-between mb-6">
                <span className="font-mono text-3xl font-extrabold text-slate-500">
                  {step.num}
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-teal-300">
                  {step.tag}
                </span>
              </div>

              {/* Step Title */}
              <h3 className="font-heading font-extrabold text-2xl text-white mb-2 flex items-center gap-2">
                <span>{step.title}</span>
                {activeStep === idx && (
                  <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping"></span>
                )}
              </h3>

              <div className="text-xs font-mono text-slate-400 mb-4 flex items-center gap-1">
                <span>Execution Speed:</span>
                <strong className="text-teal-300 font-bold">{step.timing}</strong>
              </div>

              <p className="text-sm text-slate-300 leading-relaxed mb-6 font-body">
                {step.desc}
              </p>

              {/* Technical Detail Callout */}
              <div className="glass-inset p-3 text-xs font-mono text-slate-400 border-slate-800/80">
                <span className="text-slate-500 font-bold block mb-1">ENGINE BEHAVIOR:</span>
                {step.technical}
              </div>
            </div>
          ))}
        </div>

        {/* Quick Lifecycle Verification Pill Strip */}
        <div className="glass-panel p-6 bg-[#080D1A] flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-mono">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-slate-200">
              Deterministic Rehydration Guarantee: <strong className="text-teal-300">100% Precision</strong>
            </span>
          </div>
          <div className="flex items-center gap-6 text-slate-400">
            <span>● AES-256 Envelope Cipher</span>
            <span>● Sub-50ms MTTR</span>
            <span>● 0% Customer Churn</span>
          </div>
        </div>
      </div>
    </section>
  );
};
