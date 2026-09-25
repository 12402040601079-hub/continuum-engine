import React, { useState } from 'react';
import { useScrollReveal } from './useScrollReveal';

export const CoreProblemSection: React.FC = () => {
  const revealRef = useScrollReveal();
  const [simulatedState, setSimulatedState] = useState<'normal' | 'deploy' | 'crash'>('normal');

  return (
    <section id="problem" className="py-24 bg-tone-darker border-t border-slate-800/80 relative">
      <div ref={revealRef} className="scroll-reveal max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-16">
          <span className="section-tag">02 — THE CORE PROBLEM</span>
          <h2 className="section-title mb-4">
            The Silent Killer of Continuous Deployment
          </h2>
          <p className="section-desc">
            Modern Single Page Applications (React, Vue, Angular, Flutter Web) split JavaScript into dynamic chunks. But CI/CD rollouts create an unavoidable race condition on edge CDNs.
          </p>
        </div>

        {/* 3 Problem Column Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="glass-panel p-6 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 font-mono text-sm font-bold mb-4">
                01
              </div>
              <h3 className="font-heading font-bold text-lg text-white mb-2">
                Hashed Dynamic Chunking
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed font-body">
                Webpack, Vite, and Rollup generate split files like <code className="text-teal-300 font-mono text-xs bg-slate-900 px-1 py-0.5 rounded">step3.a8f91b.js</code> to minimize initial bundle download times.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-800/80 text-xs font-mono text-slate-400">
              ⚡ CDN Target: <span className="text-slate-300">/assets/chunk.[hash].js</span>
            </div>
          </div>

          <div className="glass-panel p-6 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-mono text-sm font-bold mb-4">
                02
              </div>
              <h3 className="font-heading font-bold text-lg text-white mb-2">
                The CDN Purge Collision
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed font-body">
                When DevOps pushes a new release (v1.0.1 replacing v1.0.0), edge CDNs invalidate old hashes. But users on active sessions still hold references to old chunks.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-800/80 text-xs font-mono text-amber-300">
              ⚠️ Edge Status: <span className="text-slate-300">Hash Purged from Cache</span>
            </div>
          </div>

          <div className="glass-panel p-6 flex flex-col justify-between border-rose-500/30 hover:border-rose-500/60">
            <div>
              <div className="w-10 h-10 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 font-mono text-sm font-bold mb-4">
                03
              </div>
              <h3 className="font-heading font-bold text-lg text-white mb-2">
                Fatal 404 & State Amnesia
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed font-body">
                When the applicant clicks &quot;Next&quot;, the browser requests the purged chunk, triggers an unhandled <code className="text-rose-400 font-mono text-xs bg-rose-950/40 px-1 py-0.5 rounded">404 ChunkLoadError</code>, and crashes to a blank screen, losing all in-progress form data.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-800/80 text-xs font-mono text-rose-400">
              💥 Result: <span className="text-slate-300">100% Uncommitted Data Loss</span>
            </div>
          </div>
        </div>

        {/* Interactive Failure Simulation Diagram */}
        <div className="glass-panel p-6 sm:p-8 bg-[#080C16] border-slate-800">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 mb-6 border-b border-slate-800/80 gap-4">
            <div>
              <h3 className="font-heading font-bold text-xl text-white flex items-center gap-2">
                <span>Interactive Failure Diagram</span>
                <span className="text-xs font-mono font-normal text-slate-400 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">
                  Live Anatomy
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Click the states below to visualize the deployment collision timeline
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setSimulatedState('normal')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                  simulatedState === 'normal'
                    ? 'bg-blue-600 text-white font-bold'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                1. In-Flight Session
              </button>
              <button
                onClick={() => setSimulatedState('deploy')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                  simulatedState === 'deploy'
                    ? 'bg-amber-600 text-white font-bold'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                2. CI/CD Deploy
              </button>
              <button
                onClick={() => setSimulatedState('crash')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                  simulatedState === 'crash'
                    ? 'bg-rose-600 text-white font-bold'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                3. 404 Crash Flash
              </button>
            </div>
          </div>

          {/* Diagram Canvas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
            {/* Node 1: Client SPA */}
            <div className="glass-inset p-4 text-center border-blue-500/20">
              <div className="text-2xl mb-2">👤</div>
              <div className="text-xs font-mono uppercase text-slate-400 font-bold">Applicant Client</div>
              <div className="text-sm font-semibold text-white mt-1">
                {simulatedState === 'crash' ? 'Form Destroyed' : 'Filling Step 3 Form'}
              </div>
              <div className="text-[10px] font-mono text-slate-400 mt-1">
                Running: <span className="text-blue-300">Bundle v1.0.0</span>
              </div>
            </div>

            {/* Arrow 1 */}
            <div className="flex flex-col items-center justify-center text-center">
              <span className="text-xs font-mono text-slate-400 mb-1">
                {simulatedState === 'crash' ? 'GET 404' : 'GET chunk.js'}
              </span>
              <div className={`w-full h-0.5 transition-colors ${simulatedState === 'crash' ? 'bg-rose-500 animate-pulse' : 'bg-blue-500'}`} />
              <span className={`text-[10px] font-mono mt-1 ${simulatedState === 'crash' ? 'text-rose-400 font-bold' : 'text-slate-400'}`}>
                {simulatedState === 'crash' ? '❌ Network Failure' : 'Fetch Async Module'}
              </span>
            </div>

            {/* Node 2: Edge CDN */}
            <div className={`glass-inset p-4 text-center transition-all ${
              simulatedState === 'deploy'
                ? 'border-amber-500/50 bg-amber-950/20'
                : simulatedState === 'crash'
                ? 'border-rose-500/50 bg-rose-950/20'
                : 'border-slate-800'
            }`}>
              <div className="text-2xl mb-2">☁️</div>
              <div className="text-xs font-mono uppercase text-slate-400 font-bold">Cloudflare / Fastly CDN</div>
              <div className="text-sm font-semibold text-white mt-1">
                {simulatedState === 'normal' && 'Serving v1.0.0 Chunks'}
                {simulatedState === 'deploy' && 'Purging Old Hashes (v1.0.1)'}
                {simulatedState === 'crash' && 'HTTP 404 Not Found'}
              </div>
              <div className="text-[10px] font-mono text-slate-400 mt-1">
                Cached: <span className={simulatedState === 'normal' ? 'text-teal-300' : 'text-amber-300'}>
                  {simulatedState === 'normal' ? 'step3.a8f91b.js' : 'Purged from Origin'}
                </span>
              </div>
            </div>

            {/* Node 3: Crash Outcome */}
            <div className={`glass-inset p-4 text-center border transition-all ${
              simulatedState === 'crash'
                ? 'border-rose-500 bg-rose-950/40 shadow-lg shadow-rose-900/30'
                : 'border-slate-800 opacity-60'
            }`}>
              <div className="text-2xl mb-2">{simulatedState === 'crash' ? '💥' : '🛡️'}</div>
              <div className="text-xs font-mono uppercase text-slate-400 font-bold">Without Continuum</div>
              <div className={`text-sm font-semibold mt-1 ${simulatedState === 'crash' ? 'text-rose-300' : 'text-slate-300'}`}>
                {simulatedState === 'crash' ? 'Blank White Screen' : 'Vulnerable to 404'}
              </div>
              <div className="text-[10px] font-mono text-slate-400 mt-1">
                State: <span className={simulatedState === 'crash' ? 'text-rose-400 font-bold' : 'text-slate-400'}>
                  {simulatedState === 'crash' ? 'DESTROYED' : 'At Risk'}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400">
            <span>Diagnosed by: <strong className="text-slate-200">Stale Asset Telemetry Analyzer</strong></span>
            <span className="font-mono text-teal-300">Solution: Continuum Engine StaleAssetBoundary Protocol</span>
          </div>
        </div>
      </div>
    </section>
  );
};
