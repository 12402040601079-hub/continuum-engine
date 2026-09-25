import React from 'react';
import { useScrollReveal } from './useScrollReveal';

export const TechStackSection: React.FC = () => {
  const revealRef = useScrollReveal();

  const techStack = [
    {
      name: 'FastAPI',
      category: 'Backend & WebSockets',
      icon: '⚡',
      badge: 'Python 3.11+',
      desc: 'High-performance ASGI asynchronous web framework with native WebSockets, Pydantic v2 data validation, and sub-millisecond request routing.',
    },
    {
      name: 'Flutter Web',
      category: 'Multi-Platform Client',
      icon: '💙',
      badge: 'Dart 3.x',
      desc: 'Production cross-platform mobile and web client interface providing deterministic rendering, Material 3 UI, and offline state persistence.',
    },
    {
      name: 'MongoDB',
      category: 'Persistence & TTL Vault',
      icon: '🍃',
      badge: 'Async Motor Driver',
      desc: 'High-throughput document store configured with compound query indexes, automatic 15-minute TTL auto-purge, and in-memory failover fallback.',
    },
    {
      name: 'Google Gemini AI',
      category: 'Multimodal Co-Pilot',
      icon: '✨',
      badge: 'Gemini 1.5 Flash',
      desc: 'Autonomous multimodal document parsing for paystubs/tax forms and real-time underwriting risk inference (DTI and APR bracket calculations).',
    },
    {
      name: 'Three.js / WebGL',
      category: '3D Visualization Engine',
      icon: '🌌',
      badge: 'WebGL r128',
      desc: 'Interactive 3D particle ether canvas with 3,500 particles, gyroscopic card parallax, and GPU density scaling for low-power mobile devices.',
    },
    {
      name: 'Google Antigravity',
      category: 'Agentic Engineering',
      icon: '🛡️',
      badge: 'DeepMind Architecture',
      desc: 'Advanced agentic pair-programming orchestrator powering automated test suites, CI/CD pipeline automation, and zero-defect deployments.',
    },
  ];

  return (
    <section id="stack" className="py-24 bg-tone-dark border-t border-slate-800/80 relative">
      <div ref={revealRef} className="scroll-reveal max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center mb-16">
          <span className="section-tag">13 — TECHNOLOGY STACK</span>
          <h2 className="section-title mb-4">
            Engineered on Best-in-Class Infrastructure
          </h2>
          <p className="section-desc">
            Combining asynchronous Python backend primitives, cryptographic vaulting, WebGL graphics, and Google multimodal intelligence.
          </p>
        </div>

        {/* 6 Tech Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {techStack.map((tech, idx) => (
            <div key={idx} className="glass-panel p-6 flex flex-col justify-between hover:border-blue-500/40">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl">{tech.icon}</span>
                  <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/30 text-teal-300">
                    {tech.badge}
                  </span>
                </div>

                <div className="text-xs font-mono uppercase text-slate-400 font-bold mb-1">
                  {tech.category}
                </div>
                <h3 className="font-heading font-extrabold text-xl text-white mb-2">
                  {tech.name}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed font-body">
                  {tech.desc}
                </p>
              </div>

              <div className="mt-6 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>Production Tier</span>
                <span className="text-teal-300">● 100% Verified</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
