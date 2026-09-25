import React, { useState, useEffect } from 'react';
import { useScrollReveal } from './useScrollReveal';

export const LiveDemoSection: React.FC = () => {
  const revealRef = useScrollReveal();
  const [currentSecond, setCurrentSecond] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  // 19-second timeline loop
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setCurrentSecond((prev) => (prev >= 19 ? 0 : prev + 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Determine stage based on currentSecond
  const getStageInfo = (sec: number) => {
    if (sec <= 5) {
      return {
        stage: 1,
        title: 'Applicant Input Active',
        status: 'Autosave Pulse Active (#00F0FF)',
        color: 'text-blue-400',
        borderColor: 'border-blue-500/40',
        detail: 'User typing $95,000 Income & $50,000 Loan Request. In-flight state mirrored in cryptographic memory buffer.',
      };
    } else if (sec <= 8) {
      return {
        stage: 2,
        title: 'CI/CD Deployment Release (v1.0.1)',
        status: 'CDN Hash Invalidation Window',
        color: 'text-amber-400',
        borderColor: 'border-amber-500/40',
        detail: 'Production deploy rolls out. Edge CDN purges previous build chunks while session is in flight.',
      };
    } else if (sec <= 11) {
      return {
        stage: 3,
        title: '💥 HTTP 404 ChunkLoadError Intercepted',
        status: 'StaleAssetBoundary Tripped',
        color: 'text-rose-400',
        borderColor: 'border-rose-500/50',
        detail: 'User navigates step. Network returns 404 for chunk. StaleAssetBoundary catches exception in 12ms before UI crashes.',
      };
    } else if (sec <= 14) {
      return {
        stage: 4,
        title: '🔐 AES-256 State Vaulting Protocol',
        status: 'Dispatched to /session/vault',
        color: 'text-purple-400',
        borderColor: 'border-purple-500/50',
        detail: 'Form progress encrypted with AES-256-CBC, signed with session JWT, and secured in vault in under 28ms.',
      };
    } else if (sec <= 17) {
      return {
        stage: 5,
        title: '🔄 Atomic Bundle Cache-Bust Reload',
        status: 'Fetching Production Assets',
        color: 'text-cyan-400',
        borderColor: 'border-cyan-500/40',
        detail: 'Clean hard reload bypasses stale cache, downloads v1.0.1 code bundle, engages monotonic anti-loop latch.',
      };
    } else {
      return {
        stage: 6,
        title: '🎯 100% Precision State Rehydration',
        status: 'Fully Restored with 0% Data Loss',
        color: 'text-emerald-400',
        borderColor: 'border-emerald-500/50',
        detail: 'Fresh application initializes, decrypts session vault, and restores applicant directly to Step 3 with all inputs intact! MTTR: 38ms.',
      };
    }
  };

  const stage = getStageInfo(currentSecond);

  return (
    <section id="demo" className="py-24 bg-tone-dark border-t border-slate-800/80 relative">
      <div ref={revealRef} className="scroll-reveal max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center mb-16">
          <span className="section-tag">07 — LIVE SIMULATION LAB</span>
          <h2 className="section-title mb-4">
            The 3-Second Zero-Data-Loss Recovery Loop
          </h2>
          <p className="section-desc">
            Experience the automated recovery sequence frame-by-frame. No white screens, no lost forms, no customer churn.
          </p>
        </div>

        {/* Live Simulation Shell */}
        <div className="glass-panel p-6 sm:p-8 bg-[#070B14] border-slate-800 max-w-5xl mx-auto shadow-2xl">
          {/* Simulation Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 mb-6 border-b border-slate-800 gap-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🎬</span>
              <div>
                <h3 className="font-heading font-bold text-lg text-white">
                  Continuous Deployment Interception Timeline
                </h3>
                <span className="text-xs font-mono text-slate-400">
                  Simulated 404 Incident Recovery Timeline (00:00–00:19)
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="px-3.5 py-1.5 rounded-lg bg-blue-600/20 border border-blue-500/40 text-blue-300 font-mono text-xs font-bold hover:bg-blue-600/30 transition-all flex items-center gap-1.5"
              >
                <span>{isPlaying ? '⏸ Pause' : '▶ Play'}</span>
              </button>
              <div className="font-mono text-sm font-bold text-teal-300 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg">
                00:{currentSecond.toString().padStart(2, '0')} / 00:19
              </div>
            </div>
          </div>

          {/* Interactive Timeline Scrubber */}
          <div className="mb-8">
            <input
              type="range"
              min="0"
              max="19"
              value={currentSecond}
              onChange={(e) => setCurrentSecond(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-400"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-2">
              <span>00:00 Input</span>
              <span>00:06 Deploy</span>
              <span>00:09 404 Crash</span>
              <span>00:12 Vault</span>
              <span>00:15 Reload</span>
              <span>00:19 Restored</span>
            </div>
          </div>

          {/* Stage Visualizer Box */}
          <div className={`glass-panel p-6 sm:p-8 bg-[#050810] border-2 transition-all duration-300 ${stage.borderColor} mb-6`}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  STAGE 0{stage.stage}
                </span>
                <span className={`text-xs font-mono font-bold ${stage.color}`}>
                  ● {stage.status}
                </span>
              </div>
              <span className="text-xs font-mono text-slate-400">
                Latent Impact: &lt; 38ms MTTR
              </span>
            </div>

            <h4 className="font-heading font-extrabold text-2xl text-white mb-2">
              {stage.title}
            </h4>

            <p className="text-sm text-slate-300 leading-relaxed font-body mb-6">
              {stage.detail}
            </p>

            {/* Micro Mockup Preview Box */}
            <div className="glass-inset p-4 font-mono text-xs text-slate-300 space-y-1.5">
              <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-2 mb-2">
                <span>SIMULATED_CLIENT_HUD</span>
                <span className="text-teal-300">SESSION: sess-9941a80c92</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Active Form Step:</span>
                <span className="text-white font-bold">{currentSecond >= 18 ? 'Step 3: Loan Options (100% Restored)' : currentSecond >= 10 ? 'Step 3: Intercepted in Memory' : 'Step 2: Financial Inputs'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Vault Encryption:</span>
                <span className="text-emerald-400 font-bold">{currentSecond >= 12 ? 'AES-256-CBC Encrypted & Signed' : 'Ready (Keystroke Autosave)'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Observed Downtime:</span>
                <span className="text-teal-300 font-bold">{currentSecond >= 18 ? '0 ms (Sub-Perceptual)' : 'Active Monitoring'}</span>
              </div>
            </div>
          </div>

          {/* Action Link to Live App */}
          <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-slate-800 text-xs text-slate-400 gap-3">
            <span>Want to test this live with real browser network throttling?</span>
            <a
              href="/app"
              className="text-teal-300 hover:text-teal-200 font-bold font-heading flex items-center gap-1.5 underline"
            >
              <span>Test Live 404 Simulator in Web App →</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
