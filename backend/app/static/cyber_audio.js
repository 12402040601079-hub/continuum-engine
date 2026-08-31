/**
 * Continuum Engine - Cyber Audio Synthesis & Spectral Visualizer Engine
 * Pure Web Audio API procedural synthesizer (zero external audio file dependencies)
 */

class CyberAudioEngine {
  constructor() {
    this.ctx = null;
    this.analyser = null;
    this.isMuted = false;
    this.isInitialized = false;
    this.droneGain = null;
    this.droneOsc = null;
    this.visualizerCanvas = null;
    this.visualizerCtx = null;
    this.animFrameId = null;
  }

  /**
   * Initializes audio context on first user gesture
   */
  init() {
    if (this.isInitialized) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 64;
      this.analyser.smoothingTimeConstant = 0.8;
      this.analyser.connect(this.ctx.destination);
      this.isInitialized = true;
      this.startAmbientDrone();
      console.log("⚡ Cyber Audio Engine initialized at", this.ctx.sampleRate, "Hz");
    } catch (e) {
      console.warn("Web Audio API not supported:", e);
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.droneGain) {
      this.droneGain.gain.setValueAtTime(this.isMuted ? 0 : 0.02, this.ctx?.currentTime || 0);
    }
    return this.isMuted;
  }

  /**
   * Ambient Quantum Sub-Drone
   */
  startAmbientDrone() {
    if (!this.ctx || this.isMuted) return;
    try {
      this.droneOsc = this.ctx.createOscillator();
      this.droneGain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      this.droneOsc.type = "sine";
      this.droneOsc.frequency.setValueAtTime(55, this.ctx.currentTime); // 55Hz (A1)

      filter.type = "lowpass";
      filter.frequency.setValueAtTime(120, this.ctx.currentTime);

      this.droneGain.gain.setValueAtTime(0.025, this.ctx.currentTime);

      this.droneOsc.connect(filter);
      filter.connect(this.droneGain);
      this.droneGain.connect(this.analyser);

      this.droneOsc.start();
    } catch (e) {}
  }

  /**
   * UI Click / Blip
   */
  playChirp(freq = 1200, type = "sine", duration = 0.06) {
    if (!this.ctx || this.isMuted) return;
    if (this.ctx.state === "suspended") this.ctx.resume();

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.5, this.ctx.currentTime + duration);

    gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(this.analyser);

    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  /**
   * Soft Keystroke Reactor Pulse
   */
  playKeyPulse() {
    if (!this.ctx || this.isMuted) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "triangle";
    const baseFreq = 440 + Math.random() * 200;
    osc.frequency.setValueAtTime(baseFreq, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.5, this.ctx.currentTime + 0.04);

    gain.gain.setValueAtTime(0.03, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);

    osc.connect(gain);
    gain.connect(this.analyser);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.04);
  }

  /**
   * Sci-Fi Warp on Step Transition
   */
  playWarpSweep() {
    if (!this.ctx || this.isMuted) return;
    if (this.ctx.state === "suspended") this.ctx.resume();

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(150, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.35);

    filter.type = "bandpass";
    filter.frequency.setValueAtTime(600, this.ctx.currentTime);
    filter.Q.setValueAtTime(3.0, this.ctx.currentTime);

    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.35);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.analyser);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.35);
  }

  /**
   * Glitch Alarm & Noise Explosion on 404 Crash
   */
  playCrashAlarm() {
    if (!this.ctx || this.isMuted) return;
    if (this.ctx.state === "suspended") this.ctx.resume();

    // 1. Harsh Sawtooth Siren
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(800, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(200, this.ctx.currentTime + 0.4);
    osc.frequency.linearRampToValueAtTime(700, this.ctx.currentTime + 0.8);

    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.8);

    osc.connect(gain);
    gain.connect(this.analyser);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.8);

    // 2. White Noise Burst
    const bufferSize = this.ctx.sampleRate * 0.3;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);

    whiteNoise.connect(noiseGain);
    noiseGain.connect(this.analyser);
    whiteNoise.start();
  }

  /**
   * Rehydration Arpeggio Chime
   */
  playRehydrateChime() {
    if (!this.ctx || this.isMuted) return;
    if (this.ctx.state === "suspended") this.ctx.resume();

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 (Quantum Major)
    notes.forEach((freq, idx) => {
      const startTime = this.ctx.currentTime + (idx * 0.08);
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.12, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.3);

      osc.connect(gain);
      gain.connect(this.analyser);

      osc.start(startTime);
      osc.stop(startTime + 0.3);
    });
  }

  /**
   * Attaches real-time spectrum visualizer to an HTML Canvas
   */
  attachVisualizer(canvasElement) {
    this.visualizerCanvas = canvasElement;
    this.visualizerCtx = canvasElement.getContext("2d");
    this.renderVisualizer();
  }

  renderVisualizer() {
    if (!this.visualizerCanvas || !this.visualizerCtx) return;

    const draw = () => {
      this.animFrameId = requestAnimationFrame(draw);

      const canvas = this.visualizerCanvas;
      const ctx = this.visualizerCtx;
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      if (!this.analyser || this.isMuted) {
        // Draw idle pulse baseline
        ctx.fillStyle = "rgba(0, 240, 255, 0.15)";
        ctx.fillRect(0, height / 2 - 1, width, 2);
        return;
      }

      const bufferLength = this.analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      this.analyser.getByteFrequencyData(dataArray);

      const barWidth = (width / bufferLength) * 1.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * height;
        const gradient = ctx.createLinearGradient(0, height, 0, 0);
        gradient.addColorStop(0, "rgba(0, 240, 255, 0.2)");
        gradient.addColorStop(1, "rgba(0, 255, 157, 0.85)");

        ctx.fillStyle = gradient;
        ctx.fillRect(x, height - barHeight, barWidth - 1, barHeight);
        x += barWidth;
      }
    };
    draw();
  }
}

// Global Cyber Audio Singleton
window.cyberAudio = new CyberAudioEngine();
