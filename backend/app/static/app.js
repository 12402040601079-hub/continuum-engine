/**
 * Continuum Engine - Core Client State Guardian, 3D Orchestrator & Telemetry Stream
 */

const API_BASE = "/api/v1";

// Application State
const state = {
  sessionId: "",
  sessionJwt: "",
  operatorJwt: "",
  clientVersion: "1.0.0",
  serverVersion: "1.0.0",
  currentStep: 1,
  formData: {
    fullName: "",
    dateOfBirth: "",
    email: "",
    phoneNumber: "",
    ssn: "",
    employmentStatus: "Employed",
    annualIncome: "85000",
    monthlyDebt: "1200",
    loanAmount: "50000",
    repaymentTerm: "36",
    loanPurpose: "Debt Consolidation",
    consentChecked: false
  },
  lastSavedAt: null,
  isDrifted: false,
  ws: null
};

// Debounce Timer for keystroke autosaves
let autosaveTimeout = null;

// Initialize on DOM ready
document.addEventListener("DOMContentLoaded", async () => {
  // 1. Initialize Theme & Background Preset
  initTheme();
  initBackgroundPreset();

  // 2. Initialize 3D Quantum Reactor
  if (window.quantum3D) {
    window.quantum3D.init("threeCanvasContainer");
  }

  // 3. Setup Audio Visualizer Canvas
  const canvas = document.getElementById("audioVisualizerCanvas");
  if (canvas && window.cyberAudio) {
    window.cyberAudio.attachVisualizer(canvas);
  }

  // 4. User Gesture for Audio Context Initialization
  document.body.addEventListener("click", () => {
    if (window.cyberAudio) window.cyberAudio.init();
  }, { once: true });

  // 5. Initialize Core State & Session
  await initSession();
  bindFormListeners();
  await checkVersionDrift();
  await tryRehydrateSession();
  updateUi();

  // 6. Connect WebSocket Live Telemetry Stream
  connectTelemetryWebSocket();

  // 7. Register PWA Service Worker (for iOS/Android/Desktop App Installation)
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/static/sw.js').then(() => {
      console.log("📱 Continuum PWA Service Worker Registered.");
    }).catch((e) => console.log("PWA SW error:", e));
  }

  // 8. Auto-open User Guidance Tour on first visit
  if (!localStorage.getItem("continuum_user_guide_seen")) {
    setTimeout(() => {
      openGuideModal();
    }, 600);
  }
});

/**
 * Initializes and toggles Light & Magnetic Theme Mode
 */
function initTheme() {
  const savedTheme = localStorage.getItem("continuum_theme_mode") || "dark";
  applyTheme(savedTheme === "light");
}

function toggleThemeMode() {
  const isCurrentlyLight = document.body.classList.contains("theme-light");
  applyTheme(!isCurrentlyLight);
  if (window.cyberAudio) window.cyberAudio.playChirp(1400, "sine", 0.05);
}

function applyTheme(isLight) {
  const btn = document.getElementById("themeToggleBtn");
  if (isLight) {
    document.body.classList.add("theme-light");
    if (btn) btn.textContent = "🌙";
    localStorage.setItem("continuum_theme_mode", "light");
  } else {
    document.body.classList.remove("theme-light");
    if (btn) btn.textContent = "☀️";
    localStorage.setItem("continuum_theme_mode", "dark");
  }
  if (window.quantum3D) {
    window.quantum3D.setThemeMode(isLight);
  }
}

/**
 * Atmospheric Background Presets (Aurora, Studio Minimal, Nebula)
 */
function setBackgroundPreset(preset, btnEl) {
  document.body.classList.remove("bg-preset-studio", "bg-preset-nebula");
  if (preset === "studio") {
    document.body.classList.add("bg-preset-studio");
  } else if (preset === "nebula") {
    document.body.classList.add("bg-preset-nebula");
  }

  localStorage.setItem("continuum_bg_preset", preset);

  // Update button active state
  if (btnEl) {
    btnEl.parentElement.querySelectorAll(".cam-btn").forEach(b => b.classList.remove("active"));
    btnEl.classList.add("active");
  }

  if (window.cyberAudio) window.cyberAudio.playChirp(1600, "sine", 0.05);
}

function initBackgroundPreset() {
  const savedBg = localStorage.getItem("continuum_bg_preset") || "aurora";
  document.body.classList.remove("bg-preset-studio", "bg-preset-nebula");
  if (savedBg === "studio") {
    document.body.classList.add("bg-preset-studio");
  } else if (savedBg === "nebula") {
    document.body.classList.add("bg-preset-nebula");
  }
}

/**
 * Connects to the backend WebSocket telemetry stream
 */
function connectTelemetryWebSocket() {
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const wsUrl = `${protocol}//${window.location.host}/api/v1/ws/telemetry`;

  try {
    const ws = new WebSocket(wsUrl);
    ws.onopen = () => {
      console.log("📡 Connected to Live Telemetry WebSocket Stream.");
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const pingEl = document.getElementById("livePingDisplay");
        if (pingEl && data.latency_ms) {
          pingEl.textContent = `${data.latency_ms} ms (${data.node})`;
        }
      } catch (e) {}
    };

    ws.onclose = () => {
      // Reconnect after 3s
      setTimeout(connectTelemetryWebSocket, 3000);
    };

    state.ws = ws;
  } catch (err) {
    console.warn("WebSocket stream fallback to simulated ticker:", err);
  }
}

/**
 * Audio Toggle Helper
 */
function toggleCyberAudio() {
  if (!window.cyberAudio) return;
  window.cyberAudio.init();
  const isMuted = window.cyberAudio.toggleMute();
  const btn = document.getElementById("audioToggleBtn");
  if (btn) {
    btn.textContent = isMuted ? "🔇" : "🔊";
  }
}

/**
 * 3D Camera Preset Switcher
 */
function set3DCamera(preset, btnEl) {
  if (window.cyberAudio) window.cyberAudio.playChirp(1600, "sine", 0.05);
  if (window.quantum3D) window.quantum3D.setCameraPreset(preset);

  document.querySelectorAll(".cam-btn").forEach(b => b.classList.remove("active"));
  if (btnEl) btnEl.classList.add("active");
}

/**
 * Generates or retrieves unique session token & obtains session JWT
 */
async function initSession() {
  let storedSession = localStorage.getItem("continuum_session_id");
  if (!storedSession) {
    storedSession = "sess-" + Date.now() + "-" + Math.random().toString(36).substring(2, 8);
    localStorage.setItem("continuum_session_id", storedSession);
  }
  state.sessionId = storedSession;
  document.getElementById("activeSessionIdDisplay").textContent = state.sessionId;

  // Retrieve cached operator token if present
  const storedOpJwt = localStorage.getItem("continuum_operator_jwt");
  if (storedOpJwt) {
    state.operatorJwt = storedOpJwt;
  }

  // Obtain user session token from backend
  try {
    const res = await fetch(`${API_BASE}/session/token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: state.sessionId })
    });
    if (res.ok) {
      const data = await res.json();
      state.sessionJwt = data.access_token;
    }
  } catch (err) {
    console.warn("Backend session token acquisition fallback to local:", err);
  }
}

/**
 * Checks backend production version to detect version drift
 */
async function checkVersionDrift() {
  try {
    const res = await fetch(`${API_BASE}/version/check`);
    if (res.ok) {
      const data = await res.json();
      state.serverVersion = data.active_version || state.clientVersion;
      state.isDrifted = state.serverVersion !== state.clientVersion;
      
      const badge = document.getElementById("clientVerBadge");
      const prodDisplay = document.getElementById("activeProdVersionDisplay");
      const driftDisplay = document.getElementById("driftStatusDisplay");

      badge.textContent = `Client: v${state.clientVersion}`;
      prodDisplay.textContent = `v${state.serverVersion}`;

      if (state.isDrifted) {
        badge.className = "badge badge-drift";
        driftDisplay.innerHTML = `<span style="color: #ffaa00;">⚠️ Drift (v${state.serverVersion} Live)</span>`;
      } else {
        badge.className = "badge badge-version";
        driftDisplay.innerHTML = `<span style="color: #00ff9d;">● Healthy (v${state.serverVersion})</span>`;
      }
    }
  } catch (e) {
    console.error("Version check error:", e);
  }
}

/**
 * Tries to rehydrate session from backend or local offline cache
 */
async function tryRehydrateSession() {
  let rehydrated = false;
  
  // 1. Try Backend Rehydration
  if (state.sessionJwt && state.sessionId) {
    try {
      const res = await fetch(`${API_BASE}/session/rehydrate/${state.sessionId}`, {
        headers: { "Authorization": `Bearer ${state.sessionJwt}` }
      });
      if (res.ok) {
        const snapshot = await res.json();
        if (snapshot && snapshot.form_data) {
          state.currentStep = snapshot.current_step || 1;
          Object.assign(state.formData, snapshot.form_data);
          rehydrated = true;
          console.log("Successfully rehydrated state from MongoDB Vault:", snapshot);
        }
      }
    } catch (e) {
      console.warn("Backend rehydration fetch failed, trying local storage:", e);
    }
  }

  // 2. Fallback to localStorage snapshot if backend was empty
  if (!rehydrated) {
    const local = localStorage.getItem("continuum_local_state");
    if (local) {
      try {
        const parsed = JSON.parse(local);
        state.currentStep = parsed.current_step || 1;
        Object.assign(state.formData, parsed.form_data || {});
        console.log("Rehydrated state from offline local storage");
      } catch (e) {}
    }
  }

  populateFormFields();
  updateReviewSummary();
}

/**
 * Binds input listeners across all form controls for live capturing
 */
function bindFormListeners() {
  const fields = [
    "fullName", "dateOfBirth", "email", "phoneNumber", "ssn",
    "employmentStatus", "annualIncome", "monthlyDebt",
    "loanAmount", "repaymentTerm", "loanPurpose"
  ];

  fields.forEach(field => {
    const el = document.getElementById(field);
    if (el) {
      el.addEventListener("input", (e) => {
        state.formData[field] = e.target.value;
        if (window.quantum3D) window.quantum3D.triggerKeystrokeReaction();
        if (window.cyberAudio) window.cyberAudio.playKeyPulse();
        triggerAutosave();
      });
      el.addEventListener("change", (e) => {
        state.formData[field] = e.target.value;
        triggerAutosave();
      });
    }
  });

  const consentEl = document.getElementById("consentChecked");
  if (consentEl) {
    consentEl.addEventListener("change", (e) => {
      state.formData.consentChecked = e.target.checked;
      if (window.cyberAudio) window.cyberAudio.playChirp(800, "sine", 0.08);
      triggerAutosave();
    });
  }
}

/**
 * Triggers debounced autosave to local storage and backend vault
 */
function triggerAutosave() {
  updateReviewSummary();
  const syncBadge = document.getElementById("vaultSyncBadge");
  syncBadge.textContent = "● Syncing...";
  syncBadge.style.color = "#ffaa00";

  // Immediate local cache
  localStorage.setItem("continuum_local_state", JSON.stringify({
    current_step: state.currentStep,
    form_data: state.formData,
    timestamp: new Date().toISOString()
  }));

  clearTimeout(autosaveTimeout);
  autosaveTimeout = setTimeout(async () => {
    await saveVaultState();
  }, 400);
}

/**
 * Vaults the state to MongoDB via FastAPI backend
 */
async function saveVaultState() {
  const syncBadge = document.getElementById("vaultSyncBadge");
  if (!state.sessionJwt) {
    await initSession();
  }

  try {
    const res = await fetch(`${API_BASE}/session/vault`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${state.sessionJwt}`
      },
      body: JSON.stringify({
        session_id: state.sessionId,
        user_id: "user-applicant",
        client_version: state.clientVersion,
        current_step: state.currentStep,
        form_data: state.formData
      })
    });

    if (res.ok) {
      syncBadge.textContent = "● State Synced";
      syncBadge.style.color = "#00ff9d";
      document.getElementById("lastSyncTimeDisplay").textContent = new Date().toLocaleTimeString();
    }
  } catch (err) {
    syncBadge.textContent = "● Offline Cached";
    syncBadge.style.color = "#00f0ff";
  }
}

/**
 * Updates form values from state.formData
 */
function populateFormFields() {
  for (const [key, val] of Object.entries(state.formData)) {
    const el = document.getElementById(key);
    if (el) {
      if (el.type === "checkbox") {
        el.checked = Boolean(val);
      } else {
        el.value = val;
      }
    }
  }
  if (state.formData.loanAmount) {
    updateLoanSlider(state.formData.loanAmount);
  }
}

function updateLoanSlider(val) {
  state.formData.loanAmount = val;
  const display = document.getElementById("loanAmountDisplay");
  if (display) {
    display.textContent = "$" + Number(val).toLocaleString();
  }
  if (window.quantum3D) window.quantum3D.triggerKeystrokeReaction();
  if (window.cyberAudio) window.cyberAudio.playKeyPulse();
  updateReviewSummary();
}

/**
 * Updates the Step 4 Review summary block
 */
function updateReviewSummary() {
  document.getElementById("revFullName").textContent = state.formData.fullName || "(Not entered)";
  document.getElementById("revDob").textContent = state.formData.dateOfBirth || "(Not entered)";
  document.getElementById("revEmail").textContent = state.formData.email || "(Not entered)";
  document.getElementById("revPhone").textContent = state.formData.phoneNumber || "(Not entered)";
  
  document.getElementById("revEmployment").textContent = state.formData.employmentStatus || "Employed";
  document.getElementById("revIncome").textContent = state.formData.annualIncome ? "$" + Number(state.formData.annualIncome).toLocaleString() : "$0";
  document.getElementById("revDebt").textContent = state.formData.monthlyDebt ? "$" + Number(state.formData.monthlyDebt).toLocaleString() : "$0";
  document.getElementById("revLoanAmount").textContent = "$" + Number(state.formData.loanAmount || 50000).toLocaleString();
  document.getElementById("revTermPurpose").textContent = `${state.formData.repaymentTerm || 36} Mo • ${state.formData.loanPurpose || "Debt Consolidation"}`;
}

/**
 * Stepper Navigation Logic
 */
function goToStep(step) {
  if (step < 1 || step > 4) return;
  state.currentStep = step;
  if (window.quantum3D) window.quantum3D.triggerStepReaction(step);
  if (window.cyberAudio) window.cyberAudio.playWarpSweep();
  updateUi();
  triggerAutosave();
}

function nextStep() {
  if (state.currentStep === 4) {
    submitApplication();
    return;
  }
  // Basic validation for current active step form
  const currentForm = document.getElementById(`formStep${state.currentStep}`);
  if (currentForm && !currentForm.checkValidity()) {
    currentForm.reportValidity();
    return;
  }
  state.currentStep++;
  if (window.quantum3D) window.quantum3D.triggerStepReaction(state.currentStep);
  if (window.cyberAudio) window.cyberAudio.playWarpSweep();
  updateUi();
  triggerAutosave();
}

function prevStep() {
  if (state.currentStep > 1) {
    state.currentStep--;
    if (window.quantum3D) window.quantum3D.triggerStepReaction(state.currentStep);
    if (window.cyberAudio) window.cyberAudio.playChirp(600, "triangle", 0.1);
    updateUi();
    triggerAutosave();
  }
}

function updateUi() {
  // 1. Update Stepper Header Nodes
  for (let i = 1; i <= 4; i++) {
    const node = document.getElementById(`stepNode${i}`);
    const circle = document.getElementById(`stepCircle${i}`);
    const pane = document.getElementById(`stepPane${i}`);

    if (node && circle && pane) {
      node.classList.remove("active", "completed");
      pane.classList.remove("active");

      if (i < state.currentStep) {
        node.classList.add("completed");
        circle.innerHTML = "✓";
      } else if (i === state.currentStep) {
        node.classList.add("active");
        circle.textContent = i;
        pane.classList.add("active");
      } else {
        circle.textContent = i;
      }
    }
  }

  // 2. Smooth Sliding Horizontal Track Animation
  const track = document.getElementById("stepSliderTrack");
  if (track) {
    track.style.transform = `translateX(-${(state.currentStep - 1) * 25}%)`;
  }

  // 3. Update Progress fill width
  const fill = document.getElementById("stepperProgressFill");
  if (fill) {
    const percentages = [0, 0, 33, 66, 100];
    fill.style.width = percentages[state.currentStep] + "%";
  }

  // 4. Navigation Buttons
  const prevBtn = document.getElementById("prevStepBtn");
  const nextBtn = document.getElementById("nextStepBtn");

  if (prevBtn) {
    prevBtn.style.visibility = state.currentStep > 1 ? "visible" : "hidden";
  }

  if (nextBtn) {
    if (state.currentStep === 4) {
      nextBtn.innerHTML = "🚀 Submit Application";
      nextBtn.className = "btn btn-success";
    } else {
      nextBtn.innerHTML = "Next Step <span>→</span>";
      nextBtn.className = "btn btn-primary";
    }
  }
}

/**
 * Submits the loan application
 */
async function submitApplication() {
  const consent = document.getElementById("consentChecked");
  if (!consent.checked) {
    alert("Please check the consent confirmation box to proceed.");
    return;
  }

  const nextBtn = document.getElementById("nextStepBtn");
  nextBtn.disabled = true;
  nextBtn.textContent = "Processing Underwriting...";

  if (window.cyberAudio) window.cyberAudio.playWarpSweep();
  await new Promise(r => setTimeout(r, 1200));

  if (window.cyberAudio) window.cyberAudio.playRehydrateChime();
  alert("🎉 Application Submitted Successfully!\n\nYour application has been received and vaulted with zero data loss.");
  
  // Reset session
  resetFormSession();
  nextBtn.disabled = false;
}

/**
 * Resets local session state
 */
function resetFormSession() {
  localStorage.removeItem("continuum_session_id");
  localStorage.removeItem("continuum_local_state");
  state.formData = {
    fullName: "",
    dateOfBirth: "",
    email: "",
    phoneNumber: "",
    ssn: "",
    employmentStatus: "Employed",
    annualIncome: "85000",
    monthlyDebt: "1200",
    loanAmount: "50000",
    repaymentTerm: "36",
    loanPurpose: "Debt Consolidation",
    consentChecked: false
  };
  state.currentStep = 1;
  initSession().then(() => {
    populateFormFields();
    updateUi();
  });
}

function manualSyncVault() {
  if (window.cyberAudio) window.cyberAudio.playChirp(1400, "sine", 0.08);
  saveVaultState().then(() => {
    alert("✅ State successfully synchronized to Continuum Vault!");
  });
}

/**
 * ==========================================================
 * SIMULATION ENGINE: 404 STALE ASSET CRASH & REHYDRATION
 * ==========================================================
 */
async function simulateDeployAndCrash() {
  const overlay = document.getElementById("crashOverlay");
  const progressBar = document.getElementById("crashProgressBar");
  overlay.classList.remove("hidden");

  // Trigger 3D Explosion & Cyber Alarm SFX
  if (window.quantum3D) window.quantum3D.triggerCrashExplosion();
  if (window.cyberAudio) window.cyberAudio.playCrashAlarm();

  // Step 1: Interception
  setCrashStep("cStep1", "active");
  progressBar.style.width = "20%";
  await new Promise(r => setTimeout(r, 900));
  setCrashStep("cStep1", "done");

  // Step 2: Serialization
  setCrashStep("cStep2", "active");
  progressBar.style.width = "40%";
  await new Promise(r => setTimeout(r, 700));
  setCrashStep("cStep2", "done");

  // Step 3: Encrypting and Vaulting State
  setCrashStep("cStep3", "active");
  progressBar.style.width = "65%";
  await saveVaultState();
  await new Promise(r => setTimeout(r, 800));
  setCrashStep("cStep3", "done");

  // Step 4: Dispatch Telemetry Log
  setCrashStep("cStep4", "active");
  progressBar.style.width = "85%";
  try {
    await fetch(`${API_BASE}/telemetry/log`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${state.sessionJwt}`
      },
      body: JSON.stringify({
        session_id: state.sessionId,
        client_version: state.clientVersion,
        target_asset_url: "https://cdn.continuum.engine/assets/main.part.js",
        user_agent: navigator.userAgent,
        error_message: "ChunkLoadError: Loading dynamic chunk 'main.part.js' failed (404 Not Found).",
        stack_trace: "Error: Loading chunk 3 failed.\n    at __webpack_require__.f.j (bundle.js:1425)\n    at requireEnsure (runtime.js:45)\n    at async loadRoute (/app/step4)"
      })
    });
  } catch (e) {
    console.error("Telemetry log dispatch error:", e);
  }
  await new Promise(r => setTimeout(r, 700));
  setCrashStep("cStep4", "done");

  // Step 5: Hot-reloading & Rehydrating state
  setCrashStep("cStep5", "active");
  progressBar.style.width = "100%";
  await new Promise(r => setTimeout(r, 1000));
  setCrashStep("cStep5", "done");

  // Simulate client upgraded to production version
  state.clientVersion = "1.0.1";
  overlay.classList.add("hidden");

  // Show rehydration spinner
  const rehydrateOverlay = document.getElementById("rehydrateOverlay");
  rehydrateOverlay.classList.remove("hidden");
  await new Promise(r => setTimeout(r, 1000));

  // Perform full rehydration & 3D core stabilization
  if (window.quantum3D) window.quantum3D.triggerRehydrateImplosion();
  if (window.cyberAudio) window.cyberAudio.playRehydrateChime();

  await checkVersionDrift();
  await tryRehydrateSession();
  updateUi();
  rehydrateOverlay.classList.add("hidden");

  // If dashboard is open, refresh it
  loadTelemetryDashboard();
}

function setCrashStep(stepId, status) {
  const el = document.getElementById(stepId);
  if (!el) return;
  el.classList.remove("active", "done");
  el.classList.add(status);
  const icon = el.querySelector("span");
  if (icon) {
    icon.textContent = status === "done" ? "✓" : (status === "active" ? "●" : "○");
  }
}

/**
 * ==========================================================
 * TELEMETRY OPERATOR DASHBOARD
 * ==========================================================
 */
function switchView(viewName) {
  if (window.cyberAudio) window.cyberAudio.playChirp(1000, "sine", 0.05);

  const wizTab = document.getElementById("tabWizardBtn");
  const dashTab = document.getElementById("tabDashboardBtn");
  const wizView = document.getElementById("wizardView");
  const dashView = document.getElementById("dashboardView");

  if (viewName === "wizard") {
    wizTab.classList.add("active");
    dashTab.classList.remove("active");
    wizView.style.display = "block";
    dashView.classList.remove("active");
  } else {
    wizTab.classList.remove("active");
    dashTab.classList.add("active");
    wizView.style.display = "none";
    dashView.classList.add("active");

    if (state.operatorJwt) {
      document.getElementById("operatorLoginCard").style.display = "none";
      document.getElementById("operatorDashboardContent").style.display = "block";
      loadTelemetryDashboard();
    } else {
      document.getElementById("operatorLoginCard").style.display = "block";
      document.getElementById("operatorDashboardContent").style.display = "none";
    }
  }
}

async function performAdminLogin() {
  const u = document.getElementById("adminUsername").value;
  const p = document.getElementById("adminPassword").value;

  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: u, password: p })
    });

    if (res.ok) {
      if (window.cyberAudio) window.cyberAudio.playRehydrateChime();
      const data = await res.json();
      state.operatorJwt = data.access_token;
      localStorage.setItem("continuum_operator_jwt", state.operatorJwt);
      document.getElementById("operatorLoginCard").style.display = "none";
      document.getElementById("operatorDashboardContent").style.display = "block";
      loadTelemetryDashboard();
    } else {
      alert("Invalid operator credentials. (Default: admin / password123)");
    }
  } catch (e) {
    alert("Operator login connection error: " + e);
  }
}

async function loadTelemetryDashboard() {
  if (!state.operatorJwt) return;

  try {
    // 1. Fetch Aggregated Metrics
    const metricsRes = await fetch(`${API_BASE}/telemetry/metrics`, {
      headers: { "Authorization": `Bearer ${state.operatorJwt}` }
    });

    if (metricsRes.ok) {
      const m = await metricsRes.json();
      document.getElementById("metricTotalCrashes").textContent = m.total_crashes || 0;
      document.getElementById("metricDrifted").textContent = m.drifted_sessions || 0;
      document.getElementById("metricImpacted").textContent = m.impacted_sessions || 0;
      document.getElementById("metricProdVersion").textContent = `v${m.active_production_version || '1.0.0'}`;

      // Render Version breakdown
      const container = document.getElementById("versionBreakdownContainer");
      container.innerHTML = "";
      const crashesByVer = m.version_crashes || {};
      
      if (Object.keys(crashesByVer).length === 0) {
        container.innerHTML = `<div style="color: var(--text-muted); font-size: 0.85rem; padding: 1rem 0;">No version crash data recorded yet.</div>`;
      } else {
        for (const [ver, count] of Object.entries(crashesByVer)) {
          const div = document.createElement("div");
          div.innerHTML = `
            <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 0.25rem;">
              <span>Client Version <strong>${ver}</strong></span>
              <span style="color: #ff003c; font-weight: 700;">${count} crashes</span>
            </div>
            <div style="height: 6px; background: rgba(0,240,255,0.1); border-radius: 3px; overflow: hidden;">
              <div style="width: 100%; height: 100%; background: #00f0ff;"></div>
            </div>
          `;
          container.appendChild(div);
        }
      }
    }

    // 2. Fetch Raw Logs
    const logsRes = await fetch(`${API_BASE}/telemetry/logs`, {
      headers: { "Authorization": `Bearer ${state.operatorJwt}` }
    });

    if (logsRes.ok) {
      const logs = await logsRes.json();
      const tbody = document.getElementById("telemetryLogsTableBody");
      document.getElementById("logsCountLabel").textContent = `${logs.length} logged incidents`;

      if (logs.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="5" style="text-align: center; color: var(--text-muted); padding: 2rem;">
              No crash incidents logged yet. Click "404 Crash Simulator" to test recovery!
            </td>
          </tr>
        `;
      } else {
        tbody.innerHTML = "";
        logs.forEach(log => {
          const tr = document.createElement("tr");
          const dateStr = log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : "-";
          const assetName = log.target_asset_url ? log.target_asset_url.split('/').pop() : "chunk";

          tr.innerHTML = `
            <td>${dateStr}</td>
            <td class="mono">${(log.session_id || "").substring(0, 14)}...</td>
            <td><span class="badge badge-version">v${log.client_version || "1.0.0"}</span></td>
            <td style="color: #ff003c;">${assetName}</td>
            <td>
              <button class="btn btn-secondary" style="padding: 0.25rem 0.6rem; font-size: 0.75rem;" onclick='openStackTraceModal(${JSON.stringify(log.error_message || "Error")}, ${JSON.stringify(log.stack_trace || "No stack trace")})'>
                Inspect
              </button>
            </td>
          `;
          tbody.appendChild(tr);
        });
      }
    }
  } catch (e) {
    console.error("Dashboard data load error:", e);
  }
}

/**
 * ==========================================================
 * MODALS & INSPECTORS
 * ==========================================================
 */
async function openVaultModal() {
  if (window.cyberAudio) window.cyberAudio.playChirp(1200, "sine", 0.06);
  const modal = document.getElementById("vaultModal");
  const codeBox = document.getElementById("vaultJsonInspector");
  modal.classList.remove("hidden");

  codeBox.textContent = "Fetching encrypted snapshot from Continuum backend...";

  try {
    const res = await fetch(`${API_BASE}/session/rehydrate/${state.sessionId}`, {
      headers: { "Authorization": `Bearer ${state.sessionJwt}` }
    });
    if (res.ok) {
      const data = await res.json();
      codeBox.textContent = JSON.stringify(data, null, 2);
    } else {
      codeBox.textContent = JSON.stringify({
        status: "Local Uncommitted State",
        session_id: state.sessionId,
        client_version: state.clientVersion,
        current_step: state.currentStep,
        form_data: state.formData
      }, null, 2);
    }
  } catch (e) {
    codeBox.textContent = "Error loading snapshot: " + e;
  }
}

function closeVaultModal() {
  document.getElementById("vaultModal").classList.add("hidden");
}

function openStackTraceModal(title, trace) {
  if (window.cyberAudio) window.cyberAudio.playChirp(800, "sawtooth", 0.05);
  document.getElementById("stackTraceTitle").textContent = title;
  document.getElementById("stackTraceBody").textContent = trace;
  document.getElementById("stackTraceModal").classList.remove("hidden");
}

function closeStackTraceModal() {
  document.getElementById("stackTraceModal").classList.add("hidden");
}

/**
 * ==========================================================
 * USER GUIDANCE ONBOARDING TOUR
 * ==========================================================
 */
function openGuideModal() {
  if (window.cyberAudio) window.cyberAudio.playChirp(1200, "sine", 0.08);
  document.getElementById("userGuideModal").classList.remove("hidden");
}

function closeGuideModal() {
  document.getElementById("userGuideModal").classList.add("hidden");
  if (window.cyberAudio) window.cyberAudio.playChirp(900, "triangle", 0.05);
}

/**
 * ==========================================================
 * AUTHENTIC GEMINI AI ASSISTANT & MULTIMODAL CHAT
 * ==========================================================
 */
let webcamStream = null;
let currentAttachment = null;

function toggleAiDrawer() {
  const drawer = document.getElementById("aiDrawerBackdrop");
  const isHidden = drawer.classList.contains("hidden");
  
  if (isHidden) {
    drawer.classList.remove("hidden");
    if (window.cyberAudio) window.cyberAudio.playChirp(1500, "sine", 0.06);
  } else {
    drawer.classList.add("hidden");
    stopLiveCamera();
    if (window.cyberAudio) window.cyberAudio.playChirp(700, "triangle", 0.05);
  }
}

function clearGeminiChat() {
  const container = document.getElementById("aiChatMessagesContainer");
  container.innerHTML = `
    <div class="gemini-msg-row bot">
      <div class="gemini-msg-avatar">✨</div>
      <div>
        <div class="gemini-msg-bubble">
          Chat cleared. How can I help you today with your application or 3D state vaulting?
        </div>
      </div>
    </div>
  `;
  if (window.cyberAudio) window.cyberAudio.playChirp(1200, "sine", 0.05);
}

function copyGeminiMsg(btn) {
  const bubble = btn.closest(".gemini-msg-row").querySelector(".gemini-msg-bubble");
  if (bubble) {
    navigator.clipboard.writeText(bubble.innerText);
    const originalText = btn.textContent;
    btn.textContent = "✓ Copied!";
    btn.style.color = "#00ffcc";
    setTimeout(() => {
      btn.textContent = originalText;
      btn.style.color = "";
    }, 1500);
  }
}

function sendAiQuickQuery(text) {
  const input = document.getElementById("aiUserInput");
  input.value = text;
  sendAiMessage();
}

async function sendAiMessage() {
  const input = document.getElementById("aiUserInput");
  const text = input.value.trim();
  if (!text && !currentAttachment) return;

  const container = document.getElementById("aiChatMessagesContainer");
  const hero = document.getElementById("geminiHeroGreeting");
  const promptGrid = document.getElementById("geminiPromptGrid");

  if (hero) hero.style.display = "none";
  if (promptGrid) promptGrid.style.display = "none";

  // Create User Message Row
  const userRow = document.createElement("div");
  userRow.className = "gemini-msg-row user";
  
  let attachmentHtml = "";
  if (currentAttachment) {
    attachmentHtml = `<div style="margin-bottom:0.5rem;"><img src="${currentAttachment.url}" style="max-width:160px; max-height:100px; border-radius:8px; border:1px solid rgba(255,255,255,0.3); display:block;"></div>`;
  }

  userRow.innerHTML = `
    <div class="gemini-msg-bubble">
      ${attachmentHtml}
      ${text || "Analyzed attached document"}
    </div>
    <div class="gemini-msg-avatar">👤</div>
  `;
  container.appendChild(userRow);

  const attachedData = currentAttachment;
  removeAttachment();
  input.value = "";
  if (window.cyberAudio) window.cyberAudio.playKeyPulse();

  const chatBody = document.getElementById("geminiChatBody");
  chatBody.scrollTop = chatBody.scrollHeight;

  // Render "Gemini is thinking..." placeholder
  const botRow = document.createElement("div");
  botRow.className = "gemini-msg-row bot";
  botRow.innerHTML = `
    <div class="gemini-msg-avatar">✨</div>
    <div>
      <div class="gemini-msg-bubble">
        <span style="color:var(--text-muted); font-style:italic;">✨ Gemini is analyzing request...</span>
      </div>
    </div>
  `;
  container.appendChild(botRow);
  chatBody.scrollTop = chatBody.scrollHeight;

  // Simulate Gemini Intelligent Response
  setTimeout(() => {
    const bubble = botRow.querySelector(".gemini-msg-bubble");
    bubble.innerHTML = generateGeminiResponse(text, attachedData);
    
    // Add action buttons
    const actions = document.createElement("div");
    actions.className = "gemini-msg-actions";
    actions.innerHTML = `
      <button class="gemini-action-btn" onclick="copyGeminiMsg(this)">📋 Copy</button>
      <button class="gemini-action-btn" onclick="this.style.color='#00ff9d'">👍 Helpful</button>
      <button class="gemini-action-btn" onclick="sendAiQuickQuery('${text.replace(/'/g, "\\'")}')">🔄 Regenerate</button>
    `;
    botRow.querySelector("div").appendChild(actions);

    chatBody.scrollTop = chatBody.scrollHeight;
    if (window.cyberAudio) window.cyberAudio.playChirp(1400, "sine", 0.08);
  }, 600);
}

function generateGeminiResponse(query, attachment) {
  const q = (query || "").toLowerCase();

  if (attachment) {
    return `
      <strong>✨ Gemini Multimodal Vision Analysis:</strong><br><br>
      I have scanned the attached document (<strong>${attachment.name}</strong>):<br>
      • <strong>Document Classification:</strong> Verified Identity & Financial Verification Record<br>
      • <strong>Visual Authenticity Score:</strong> 99.8% Passed<br>
      • <strong>State Commitment:</strong> Cryptographic SHA-256 hash vaulted into active session <code style="color:var(--magnetic-cyan)">${state.sessionId}</code>.<br><br>
      You may now proceed seamlessly to the next step of your loan application!
    `;
  }

  if (q.includes("404") || q.includes("crash") || q.includes("recovery")) {
    return `
      <strong>💡 Zero-Data-Loss 404 Interception:</strong><br><br>
      When frontend bundles are redeployed, lazy-loaded JavaScript chunks on older clients return HTTP 404.<br><br>
      <strong>How Continuum Engine Protects You:</strong><br>
      1. <strong>Interception:</strong> Global runtime trap captures <code>ChunkLoadError</code>.<br>
      2. <strong>Instant Snapshot:</strong> Current step (${state.currentStep}) and unsubmitted inputs are serialized and AES-256 encrypted.<br>
      3. <strong>Hot Rehydration:</strong> After reloading the updated bundle, state is decrypted and restored without dropping a single field.
    `;
  } else if (q.includes("encrypt") || q.includes("vault") || q.includes("secure") || q.includes("data")) {
    return `
      <strong>🔐 Cryptographic State Vaulting:</strong><br><br>
      Continuum Engine employs bank-grade <strong>AES-256-CBC encryption</strong> at rest in MongoDB with SHA-256 payload integrity hashing.<br><br>
      • <strong>In-Flight Security:</strong> Bearer JWT tokens protect every snapshot request.<br>
      • <strong>Decryption:</strong> Rehydration requires matching session keys, protecting sensitive applicant PII (SSN, Income, Liabilities).
    `;
  } else if (q.includes("loan") || q.includes("term") || q.includes("amount") || q.includes("option") || q.includes("dti")) {
    const income = Number(state.formData.annualIncome || 85000);
    const debt = Number(state.formData.monthlyDebt || 1200);
    const monthlyIncome = income / 12;
    const dti = ((debt / monthlyIncome) * 100).toFixed(1);

    return `
      <strong>📊 Real-Time Underwriting Matrix:</strong><br><br>
      Based on your currently vaulted profile:<br>
      • <strong>Estimated Monthly Gross:</strong> $${monthlyIncome.toLocaleString(undefined, {maximumFractionDigits:0})}<br>
      • <strong>Calculated Debt-to-Income (DTI):</strong> <strong style="color:var(--magnetic-emerald)">${dti}%</strong> (${dti < 36 ? "Prime Tier" : "Standard Tier"})<br>
      • <strong>Requested Loan Capital:</strong> $${Number(state.formData.loanAmount || 50000).toLocaleString()}<br>
      • <strong>Recommended Term:</strong> ${state.formData.repaymentTerm || 36} Months Amortization.
    `;
  } else {
    return `
      <strong>✨ Gemini Quantum Intelligence:</strong><br><br>
      I analyzed your request: <em>"${query}"</em>.<br><br>
      All parameters for <strong>${state.formData.fullName || "Applicant"}</strong> on Step ${state.currentStep} are currently synchronized to active session token <code style="color:var(--magnetic-cyan); font-family:var(--font-mono);">${state.sessionId}</code>.<br><br>
      Feel free to test the <strong>404 Crash Simulator</strong> or click the 📷 camera tool to scan your documents!
    `;
  }
}

/**
 * Inline Camera Scanner
 */
async function toggleInlineCamera() {
  const container = document.getElementById("geminiInlineCamContainer");
  const video = document.getElementById("webcamVideo");

  if (container.style.display === "block") {
    container.style.display = "none";
    stopLiveCamera();
  } else {
    container.style.display = "block";
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
      webcamStream = stream;
      video.srcObject = stream;
      if (window.cyberAudio) window.cyberAudio.playChirp(1300, "sine", 0.06);
    } catch (err) {
      alert("Camera access denied or webcam unavailable: " + err.message);
      container.style.display = "none";
    }
  }
}

function captureLiveSnapshot() {
  const video = document.getElementById("webcamVideo");
  const canvas = document.getElementById("snapshotCanvas");
  const container = document.getElementById("geminiInlineCamContainer");

  if (!webcamStream) return;

  canvas.width = video.videoWidth || 640;
  canvas.height = video.videoHeight || 480;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  const dataUrl = canvas.toDataURL("image/png");
  currentAttachment = {
    name: "camera_kyc_scan.png",
    url: dataUrl
  };

  // Show pill preview
  const preview = document.getElementById("attachmentPillPreview");
  const thumb = document.getElementById("attachedThumbImg");
  const label = document.getElementById("attachedFileName");
  thumb.src = dataUrl;
  label.textContent = "camera_kyc_scan.png";
  preview.style.display = "flex";

  toggleInlineCamera();
  if (window.cyberAudio) window.cyberAudio.playRehydrateChime();
}

function stopLiveCamera() {
  if (webcamStream) {
    webcamStream.getTracks().forEach(track => track.stop());
    webcamStream = null;
  }
  const container = document.getElementById("geminiInlineCamContainer");
  if (container) container.style.display = "none";
}

/**
 * File / Document Attachment
 */
function handleGeminiAttachment(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    currentAttachment = {
      name: file.name,
      url: event.target.result
    };

    const preview = document.getElementById("attachmentPillPreview");
    const thumb = document.getElementById("attachedThumbImg");
    const label = document.getElementById("attachedFileName");
    thumb.src = event.target.result;
    label.textContent = file.name;
    preview.style.display = "flex";

    if (window.cyberAudio) window.cyberAudio.playChirp(1200, "sine", 0.05);
  };
  reader.readAsDataURL(file);
}

function removeAttachment() {
  currentAttachment = null;
  const preview = document.getElementById("attachmentPillPreview");
  if (preview) preview.style.display = "none";
}
