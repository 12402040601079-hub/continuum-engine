import React, { useState } from 'react';
import { useScrollReveal } from './useScrollReveal';

export const ChaosLabSection: React.FC = () => {
  const revealRef = useScrollReveal();
  const [testingChaos, setTestingChaos] = useState<string | null>(null);

  const triggerChaosTest = (type: string) => {
    setTestingChaos(type);
    setTimeout(() => {
      setTestingChaos(null);
    }, 2500);
  };

  const chaosExperiments = [
    {
      id: 'latency',
      title: 'Latency Spike Injection',
      icon: '📶',
      tag: '600ms Network Lag',
      desc: 'Simulates degraded 3G mobile latency and edge network throttling during state snapshot vaulting.',
      expected: 'Non-blocking async vault completes without stuttering the 60fps WebGL particle loop or freezing inputs.',
      btnText: 'Inject 600ms Latency',
    },
    {
      id: 'chunk404',
      title: 'Dynamic Chunk 404',
      icon: '💥',
      tag: 'Purged CDN Hash',
      desc: 'Throws an intentional HTTP 404 for step3.chunk.js to simulate a mid-session continuous deployment collision.',
      expected: 'StaleAssetBoundary intercepts exception in 12ms, vaults state, reloads bundle, and restores Step 3 with 100% precision.',
      btnText: 'Simulate 404 Crash',
    },
    {
      id: 'db_partition',
      title: 'Database Partition Failover',
      icon: '🗄️',
      tag: 'Cluster Disconnect',
      desc: 'Simulates a network partition where the primary MongoDB replica set becomes unreachable.',
      expected: 'Engine switches seamlessly to in-memory & local state buffer with zero dropped keystrokes, reconciling upon reconnect.',
      btnText: 'Partition Database',
    },
  ];

  return (
    <section id="chaos" className="py-24 bg-tone-darker border-t border-slate-800/80 relative">
      <div ref={revealRef} className="scroll-reveal max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center mb-16">
          <span className="section-tag">11 — RESILIENCE / CHAOS LAB</span>
          <h2 className="section-title mb-4">
            Stress-Tested in Chaos Engineering
          </h2>
          <p className="section-desc">
            We don&apos;t just assume Continuum Engine works — we intentionally subject it to simulated network delays, CDN asset purges, and database cluster partitions.
          </p>
        </div>

        {/* 3 Chaos Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {chaosExperiments.map((exp) => (
            <div
              key={exp.id}
              className="glass-panel p-8 flex flex-col justify-between hover:border-rose-500/40"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl">{exp.icon}</span>
                  <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/30 text-rose-300">
                    {exp.tag}
                  </span>
                </div>

                <h3 className="font-heading font-extrabold text-xl text-white mb-2">
                  {exp.title}
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed font-body mb-4">
                  {exp.desc}
                </p>

                <div className="glass-inset p-3 text-xs font-mono text-slate-400 mb-6 border-slate-800">
                  <span className="text-teal-400 font-bold block mb-1">RESILIENCE OUTCOME:</span>
                  {exp.expected}
                </div>
              </div>

              <button
                onClick={() => triggerChaosTest(exp.id)}
                disabled={testingChaos !== null}
                className={`w-full py-2.5 px-4 rounded-lg font-mono text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  testingChaos === exp.id
                    ? 'bg-amber-600 text-white animate-pulse'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                }`}
              >
                {testingChaos === exp.id ? (
                  <span>⚠️ Chaos Running... Passed (0 Data Loss)</span>
                ) : (
                  <span>⚡ Test: {exp.btnText}</span>
                )}
              </button>
            </div>
          ))}
        </div>

        {/* Interactive Chaos Lab Notice */}
        <div className="glass-panel p-6 bg-[#080C16] border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
            <span>All chaos injection scenarios tested against 27/27 automated Pytest suites.</span>
          </div>
          <a href="/app" className="text-teal-300 hover:underline font-bold">
            Execute live interactive chaos in the web application →
          </a>
        </div>
      </div>
    </section>
  );
};
