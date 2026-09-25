import React, { useState } from 'react';
import { useScrollReveal } from './useScrollReveal';

export const SystemPathwaySection: React.FC = () => {
  const revealRef = useScrollReveal();
  const [activeStep, setActiveStep] = useState(0);

  const pathwaySteps = [
    {
      num: '01',
      title: 'Keystroke Autosave Pulse',
      role: 'Client SPA',
      desc: 'Applicant types into financial loan fields. Every keystroke generates an encrypted in-memory snapshot with instant cyan glow verification.',
      endpoint: 'Local Memory Buffer + JWT',
      status: 'Synced',
      badgeColor: 'text-teal-400 bg-teal-950/40 border-teal-500/30',
    },
    {
      num: '02',
      title: 'Production Deploy (v1.0.1)',
      role: 'CI/CD Pipeline',
      desc: 'DevOps triggers rolling deployment. Old hashed JavaScript chunks are purged or invalidated on edge CDNs (Cloudflare / Fastly).',
      endpoint: 'GitHub Actions / Render',
      status: 'Purged',
      badgeColor: 'text-amber-400 bg-amber-950/40 border-amber-500/30',
    },
    {
      num: '03',
      title: 'Dynamic Chunk Fetch 404',
      role: 'Browser Network',
      desc: 'Applicant advances to Step 3. Browser attempts to fetch purged chunk step3.a8f91b.js. Edge CDN responds with HTTP 404 Not Found.',
      endpoint: 'GET /assets/chunk.js (404)',
      status: 'Exception',
      badgeColor: 'text-rose-400 bg-rose-950/40 border-rose-500/30',
    },
    {
      num: '04',
      title: 'Boundary Interception',
      role: 'StaleAssetBoundary',
      desc: 'Runtime error boundary intercepts 404 ChunkLoadError before the React tree unmounts. Fatal crash halted in under 12ms.',
      endpoint: 'window.onerror / import() catch',
      status: 'Shielded',
      badgeColor: 'text-blue-400 bg-blue-950/40 border-blue-500/30',
    },
    {
      num: '05',
      title: 'AES-256 Vault & Telemetry',
      role: 'FastAPI Cluster',
      desc: 'Application serializes active progress, signs with session JWT, encrypts via AES-256-CBC, vaults to /session/vault, and dispatches crash telemetry.',
      endpoint: 'POST /api/v1/session/vault',
      status: 'Encrypted',
      badgeColor: 'text-purple-400 bg-purple-950/40 border-purple-500/30',
    },
    {
      num: '06',
      title: 'Atomic Reload & Rehydration',
      role: 'Client Rehydrator',
      desc: 'Browser executes hard cache-bust reload. Fresh bundle pulls encrypted snapshot, restores Step 3 form values with 100% precision. Zero data loss.',
      endpoint: 'GET /session/rehydrate/{id}',
      status: 'Restored',
      badgeColor: 'text-emerald-400 bg-emerald-950/40 border-emerald-500/30',
    },
  ];

  return (
    <section id="pathway" className="py-24 bg-tone-darker border-t border-slate-800/80 relative">
      <div ref={revealRef} className="scroll-reveal max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center mb-16">
          <span className="section-tag">05 — SYSTEM PATHWAY</span>
          <h2 className="section-title mb-4">
            The 6-Step End-to-End Recovery Flowchart
          </h2>
          <p className="section-desc">
            Trace the microsecond execution loop from the exact instant a 404 chunk occurs to atomic bundle refresh and precision field rehydration.
          </p>
        </div>

        {/* Pathway Stepper Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {pathwaySteps.map((step, idx) => (
            <div
              key={step.num}
              onClick={() => setActiveStep(idx)}
              className={`glass-panel p-6 cursor-pointer relative transition-all duration-300 ${
                activeStep === idx
                  ? 'border-blue-500 bg-blue-950/20 shadow-lg shadow-blue-500/15 -translate-y-1'
                  : 'hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono text-2xl font-black text-slate-500">
                  {step.num}
                </span>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${step.badgeColor}`}>
                  {step.status}
                </span>
              </div>

              <div className="text-[11px] font-mono uppercase text-slate-400 tracking-wider mb-1">
                {step.role}
              </div>
              <h3 className="font-heading font-bold text-lg text-white mb-2">
                {step.title}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed font-body mb-4">
                {step.desc}
              </p>

              <div className="mt-auto pt-3 border-t border-slate-800/80 text-[11px] font-mono text-slate-400 truncate">
                Target: <span className="text-slate-300">{step.endpoint}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Interactive Step Detail Terminal Callout */}
        <div className="glass-panel p-6 bg-[#070B14] border-blue-500/30">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block"></span>
              <span className="w-3 h-3 rounded-full bg-yellow-500/80 inline-block"></span>
              <span className="w-3 h-3 rounded-full bg-green-500/80 inline-block"></span>
              <span className="text-xs font-mono text-slate-400 ml-2">
                CONTINUUM_PROTOCOL_MONITOR // STEP_{pathwaySteps[activeStep].num}
              </span>
            </div>
            <span className="text-xs font-mono text-teal-300 font-bold">
              STATE: DETERMINISTIC RECOVERY
            </span>
          </div>

          <div className="font-mono text-xs text-slate-300 space-y-1.5 overflow-x-auto">
            <p className="text-slate-500">// Detailed technical telemetry for Step {pathwaySteps[activeStep].num}:</p>
            <p><span className="text-blue-400 font-bold">STEP_NAME:</span> {pathwaySteps[activeStep].title}</p>
            <p><span className="text-teal-400 font-bold">EXECUTOR:</span> {pathwaySteps[activeStep].role}</p>
            <p><span className="text-purple-400 font-bold">INVOCATION:</span> {pathwaySteps[activeStep].endpoint}</p>
            <p className="text-slate-400"><span className="text-emerald-400 font-bold">DESCRIPTION:</span> {pathwaySteps[activeStep].desc}</p>
          </div>
        </div>
      </div>
    </section>
  );
};
