import React from 'react';
import { useScrollReveal } from './useScrollReveal';

export const UserOnboardingSection: React.FC = () => {
  const revealRef = useScrollReveal();

  const contracts = [
    {
      num: '01',
      title: 'No Account Required',
      icon: '⚡',
      badge: 'Zero Friction',
      desc: 'Users never need to register, create passwords, or log in. Continuum generates an instant cryptographically signed HMAC-SHA256 session token on first keystroke.',
      detail: 'Anonymous token binding strictly protects session ownership without requiring user email or identity credentials.',
    },
    {
      num: '02',
      title: 'Non-Invasive Encryption',
      icon: '🛡️',
      badge: 'Zero Plaintext',
      desc: 'Form inputs containing Personally Identifiable Information (PII) are encrypted client-side using AES-256-CBC before transmission. Server disks never see raw unencrypted data.',
      detail: 'Full GDPR, HIPAA, and SOC-2 Type II compliant storage tier with unique per-session initialization vectors (IV).',
    },
    {
      num: '03',
      title: 'Ephemeral TTL Auto-Purge',
      icon: '⏳',
      badge: '15-Minute Expiry',
      desc: 'Session snapshots exist only for the duration of the deployment window. A MongoDB TTL index automatically wipes snapshots after 15 minutes of inactivity.',
      detail: 'Zero data bloat, zero abandoned session storage overhead, and zero lingering security attack surface.',
    },
  ];

  return (
    <section className="py-24 bg-tone-darker border-t border-slate-800/80 relative">
      <div ref={revealRef} className="scroll-reveal max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center mb-16">
          <span className="section-tag">08 — USER CONTRACT</span>
          <h2 className="section-title mb-4">
            Security & Privacy by Design
          </h2>
          <p className="section-desc">
            Continuum Engine is engineered to preserve state without compromising privacy, regulatory compliance, or onboarding friction.
          </p>
        </div>

        {/* 3 Contract Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {contracts.map((c) => (
            <div key={c.num} className="glass-panel p-8 flex flex-col justify-between hover:border-teal-500/40">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="text-3xl">{c.icon}</span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/30 text-teal-300 font-bold">
                    {c.badge}
                  </span>
                </div>

                <div className="text-xs font-mono text-slate-500 font-bold mb-1">
                  CONTRACT {c.num}
                </div>
                <h3 className="font-heading font-extrabold text-xl text-white mb-3">
                  {c.title}
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed font-body mb-6">
                  {c.desc}
                </p>
              </div>

              <div className="glass-inset p-3 text-xs font-mono text-slate-400 border-slate-800">
                <span className="text-teal-400 font-bold block mb-1">GUARANTEE:</span>
                {c.detail}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
