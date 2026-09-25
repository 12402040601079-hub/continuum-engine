import React, { useState } from 'react';
import { useScrollReveal } from './useScrollReveal';

export const ObservabilitySection: React.FC = () => {
  const revealRef = useScrollReveal();
  const [filterVersion, setFilterVersion] = useState('ALL');

  const crashLogs = [
    {
      time: '01:32:04 UTC',
      session: 'sess-9842a1-prod',
      version: 'v1.0.0',
      asset: 'step3.chunk.a8f91b.js',
      status: 'RECOVERED (42ms)',
      statusColor: 'text-emerald-400 bg-emerald-950/40 border-emerald-500/30',
    },
    {
      time: '01:31:48 UTC',
      session: 'sess-4412c9-demo',
      version: 'v1.0.0',
      asset: 'three_render.part.js',
      status: 'RECOVERED (38ms)',
      statusColor: 'text-emerald-400 bg-emerald-950/40 border-emerald-500/30',
    },
    {
      time: '01:30:12 UTC',
      session: 'sess-7719f0-live',
      version: 'v1.0.1',
      asset: 'kyc_document_ocr.js',
      status: 'RECOVERED (35ms)',
      statusColor: 'text-emerald-400 bg-emerald-950/40 border-emerald-500/30',
    },
    {
      time: '01:28:55 UTC',
      session: 'sess-1205b3-app',
      version: 'v1.0.0',
      asset: 'loan_summary_review.js',
      status: 'RECOVERED (40ms)',
      statusColor: 'text-emerald-400 bg-emerald-950/40 border-emerald-500/30',
    },
  ];

  const versionStats = [
    { ver: 'v1.0.0 (Stale)', count: 842, pct: 68, color: 'bg-rose-500' },
    { ver: 'v1.0.1 (Current)', count: 210, pct: 18, color: 'bg-amber-500' },
    { ver: 'v1.1.0 (Canary)', count: 98, pct: 10, color: 'bg-blue-500' },
    { ver: 'v2.0.0 (Next)', count: 42, pct: 4, color: 'bg-teal-400' },
  ];

  const filteredLogs = filterVersion === 'ALL'
    ? crashLogs
    : crashLogs.filter(l => l.version.includes(filterVersion));

  return (
    <section id="observability" className="py-24 bg-tone-slate border-t border-slate-800/80 relative">
      <div ref={revealRef} className="scroll-reveal max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center mb-16">
          <span className="section-tag">09 — REAL-TIME OBSERVABILITY</span>
          <h2 className="section-title mb-4">
            Granular Telemetry & Incident Replay
          </h2>
          <p className="section-desc">
            Move beyond vague &quot;ChunkLoadError&quot; Sentry reports. Continuum Engine captures live browser stack traces, version drift counts, and 60fps DOM mutation streams.
          </p>
        </div>

        {/* Dual Observability Grid: Chart + Live Console */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Left Column: Version Drift Bar Chart */}
          <div className="glass-panel p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
                <h3 className="font-heading font-bold text-lg text-white">
                  Crashes by Client Version
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-teal-300">
                  DRIFT METRICS
                </span>
              </div>
              <p className="text-xs text-slate-400 mb-6">
                Identifies which client versions are experiencing edge CDN chunk collisions during active canary releases.
              </p>

              {/* Animated Horizontal Bar Chart */}
              <div className="space-y-4">
                {versionStats.map((item) => (
                  <div key={item.ver}>
                    <div className="flex justify-between text-xs font-mono mb-1">
                      <span className="text-slate-300 font-bold">{item.ver}</span>
                      <span className="text-slate-400">{item.count} crashes ({item.pct}%)</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className={`h-full ${item.color} rounded-full transition-all duration-1000`}
                        style={{ width: `${item.pct}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-800 text-[11px] font-mono text-slate-400 flex items-center justify-between">
              <span>WebSocket Node: <strong className="text-teal-300">us-east-core</strong></span>
              <span className="text-emerald-400 font-bold">● Streaming (1 msg/s)</span>
            </div>
          </div>

          {/* Right Column: Live Console Feed Mockup */}
          <div className="lg:col-span-2 glass-panel p-6 bg-[#060912] border-slate-800 shadow-2xl">
            {/* Console Toolbar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 mb-4 border-b border-slate-800 gap-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                <span className="text-xs font-mono text-slate-300 font-bold">
                  LIVE TELEMETRY INGESTION CONSOLE
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="text-slate-400">Filter:</span>
                <button
                  onClick={() => setFilterVersion('ALL')}
                  className={`px-2 py-1 rounded ${filterVersion === 'ALL' ? 'bg-blue-600 text-white font-bold' : 'bg-slate-900 text-slate-400'}`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilterVersion('1.0.0')}
                  className={`px-2 py-1 rounded ${filterVersion === '1.0.0' ? 'bg-blue-600 text-white font-bold' : 'bg-slate-900 text-slate-400'}`}
                >
                  v1.0.0
                </button>
                <button
                  onClick={() => setFilterVersion('1.0.1')}
                  className={`px-2 py-1 rounded ${filterVersion === '1.0.1' ? 'bg-blue-600 text-white font-bold' : 'bg-slate-900 text-slate-400'}`}
                >
                  v1.0.1
                </button>
              </div>
            </div>

            {/* Table Mockup */}
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-800/80 pb-2">
                    <th className="pb-2">Timestamp</th>
                    <th className="pb-2">Session ID</th>
                    <th className="pb-2">Version</th>
                    <th className="pb-2">Target Asset</th>
                    <th className="pb-2 text-right">Recovery Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40">
                  {filteredLogs.map((log, idx) => (
                    <tr key={idx} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-2.5 text-slate-400 whitespace-nowrap">{log.time}</td>
                      <td className="py-2.5 text-teal-300 font-bold">{log.session}</td>
                      <td className="py-2.5 text-slate-300">{log.version}</td>
                      <td className="py-2.5 text-rose-300 truncate max-w-[140px]">{log.asset}</td>
                      <td className="py-2.5 text-right">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${log.statusColor}`}>
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>Export options available: CSV, JSON, and SOC-2 Post-Mortem PDF</span>
              <a href="/app" className="text-teal-300 hover:underline">
                View Full Operator Dashboard →
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
