import React, { useState } from 'react';
import { useScrollReveal } from './useScrollReveal';

export const DataArchitectureSection: React.FC = () => {
  const revealRef = useScrollReveal();
  const [activeSchema, setActiveSchema] = useState<'telemetry' | 'snapshots'>('snapshots');
  const [copied, setCopied] = useState(false);

  const schemas = {
    snapshots: `{
  "_id": "sess-9842a1-prod",
  "session_jwt_hash": "e8b9410ac88d92ef10842bb502931a74",
  "client_version": "1.0.1",
  "current_step": 3,
  "encrypted_payload": "U2FsdGVkX19G4K...[AES-256-CBC CIPHERTEXT]...",
  "iv": "3a81f9301a5f4ec7",
  "vault_metadata": {
    "device_type": "desktop_spa",
    "keystroke_pulse_count": 42,
    "integrity_checksum": "sha256-0a91f..."
  },
  "last_saved_at": ISODate("2026-09-26T01:30:00.000Z"),
  "expires_at": ISODate("2026-09-26T01:45:00.000Z") // 15-Min TTL Auto-Purge
}`,
    telemetry: `{
  "_id": "log_incident_8812a",
  "session_id": "sess-9842a1-prod",
  "client_version": "1.0.0",
  "active_server_version": "1.0.1",
  "target_asset_url": "https://cdn.continuum.engine/assets/chunk.step3.js",
  "error_message": "ChunkLoadError: Loading dynamic chunk failed (404 Not Found)",
  "stack_trace": "Error: ChunkLoadError\\n  at loadRoute (bundle.js:1425)\\n  at async loadStep3 (/app/wizard)",
  "dom_mutation_frames": [
    { "frame": 1, "action": "input:fullName", "ts": 12 },
    { "frame": 2, "action": "input:annualIncome", "ts": 24 },
    { "frame": 3, "action": "nav:step3_trigger", "ts": 36 }
  ],
  "timestamp": ISODate("2026-09-26T01:30:00.000Z")
}`
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(schemas[activeSchema]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="architecture" className="py-24 bg-tone-slate border-t border-slate-800/80 relative">
      <div ref={revealRef} className="scroll-reveal max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center mb-16">
          <span className="section-tag">12 — DATA ARCHITECTURE</span>
          <h2 className="section-title mb-4">
            MongoDB Compound Indexes & Schemas
          </h2>
          <p className="section-desc">
            Engineered for high-throughput write bursts, zero-plaintext storage of PII, and automated TTL auto-expiry.
          </p>
        </div>

        {/* Schema Viewer Terminal */}
        <div className="glass-panel p-6 sm:p-8 bg-[#060912] border-slate-800 max-w-4xl mx-auto shadow-2xl">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 mb-6 border-b border-slate-800 gap-4">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500/80"></span>
              <span className="w-3 h-3 rounded-full bg-yellow-500/80"></span>
              <span className="w-3 h-3 rounded-full bg-green-500/80"></span>
              <span className="text-xs font-mono text-slate-400 ml-2">
                COLLECTION: {activeSchema === 'snapshots' ? 'session_snapshots' : 'telemetry_logs'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveSchema('snapshots')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                  activeSchema === 'snapshots'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                }`}
              >
                session_snapshots
              </button>
              <button
                onClick={() => setActiveSchema('telemetry')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                  activeSchema === 'telemetry'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                }`}
              >
                telemetry_logs
              </button>
              <button
                onClick={handleCopy}
                className="px-3 py-1.5 rounded-lg text-xs font-mono bg-slate-800 hover:bg-slate-700 text-teal-300 font-bold border border-slate-700 transition-all ml-2"
              >
                {copied ? '✓ Copied' : '📋 Copy JSON'}
              </button>
            </div>
          </div>

          {/* JSON Schema Code Box */}
          <div className="glass-inset p-5 overflow-x-auto">
            <pre className="font-mono text-xs sm:text-sm text-slate-200 leading-relaxed">
              <code>{schemas[activeSchema]}</code>
            </pre>
          </div>

          {/* Schema Metadata Specs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-4 border-t border-slate-800 text-xs font-mono text-slate-400">
            <div>
              <span className="text-slate-500 block mb-0.5">COMPOUND INDEX:</span>
              <span className="text-teal-300">
                {activeSchema === 'snapshots' ? '(last_saved_at: -1, user_id: 1)' : '(timestamp: -1, session_id: 1)'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block mb-0.5">TTL AUTO-EXPIRY:</span>
              <span className="text-emerald-400">
                {activeSchema === 'snapshots' ? 'expires_at (15 Minutes TTL)' : 'Retention: 30 Days rolling'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block mb-0.5">CIPHER ENCRYPTION:</span>
              <span className="text-purple-300">
                {activeSchema === 'snapshots' ? 'AES-256-CBC Envelope Cipher' : 'HMAC-SHA256 Signed Trace'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
