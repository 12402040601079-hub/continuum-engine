import React from 'react';
import { useScrollReveal } from './useScrollReveal';

export const OperationsSection: React.FC = () => {
  const revealRef = useScrollReveal();

  const operationsCards = [
    {
      title: 'Cluster Health',
      status: 'Operational (99.99%)',
      icon: '⚡',
      accent: 'text-emerald-400',
      badge: 'High Availability',
      desc: 'Stateless FastAPI ASGI nodes running asynchronous worker loops with automatic health probes and 120 req/min rate limiting DDOS protection.',
      specs: 'Uptime: 99.99% • Memory footprint: < 65MB • Python 3.11+ / Uvicorn',
    },
    {
      title: 'Encryption Cipher',
      status: 'AES-256-CBC (PKCS7)',
      icon: '🛡️',
      accent: 'text-purple-400',
      badge: 'Zero Plaintext',
      desc: 'All in-flight state snapshots are encrypted client-side with 256-bit symmetric keys and unique initialization vectors. Signed with HMAC-SHA256 session JWTs.',
      specs: 'Standard: NIST FIPS 197 • Envelope Encryption • Per-session salt',
    },
    {
      title: 'Database Backend',
      status: 'MongoDB Async Motor',
      icon: '🗄️',
      accent: 'text-cyan-400',
      badge: 'Compound Indexes + TTL',
      desc: 'Non-blocking Motor asyncio client with 300ms connection timeout and automatic failover to in-memory MockDatabase if primary cluster partitions.',
      specs: 'Index: (timestamp, -1), (session_id, 1) • TTL: 15-minute auto-expiry',
    },
    {
      title: 'Rolling Releases',
      status: 'Zero-Downtime Releases',
      icon: '🚀',
      accent: 'text-blue-400',
      badge: 'Version Drift Latch',
      desc: 'Monotonic state tracking detects version upgrades dynamically, triggering transparent atomic bundle reloads without prompting users to re-enter data.',
      specs: 'Protocol: StaleAssetBoundary • Auto-rehydration latch • No reload loop',
    },
  ];

  return (
    <section id="operations" className="py-24 bg-tone-dark border-t border-slate-800/80 relative">
      <div ref={revealRef} className="scroll-reveal max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center mb-16">
          <span className="section-tag">10 — OPERATIONS</span>
          <h2 className="section-title mb-4">
            Enterprise Operator Command Center
          </h2>
          <p className="section-desc">
            Production-grade cluster monitoring, cryptographic key management, and zero-downtime release controls.
          </p>
        </div>

        {/* 4 Operations Status Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {operationsCards.map((card, idx) => (
            <div key={idx} className="glass-panel p-8 flex flex-col justify-between hover:border-blue-500/40">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl">{card.icon}</span>
                  <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/30 text-teal-300">
                    {card.badge}
                  </span>
                </div>

                <div className="text-xs font-mono uppercase text-slate-400 font-bold mb-1">
                  {card.title}
                </div>
                <div className={`font-heading font-extrabold text-2xl ${card.accent} mb-3`}>
                  {card.status}
                </div>
                <p className="text-sm text-slate-300 leading-relaxed font-body mb-6">
                  {card.desc}
                </p>
              </div>

              <div className="glass-inset p-3 text-xs font-mono text-slate-400 border-slate-800">
                <span className="text-slate-500 font-bold block mb-1">TECHNICAL SPECIFICATIONS:</span>
                {card.specs}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
