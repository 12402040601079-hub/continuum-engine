/**
 * Continuum Engine - Visible & Eye-Comforting Ambient Aurora Canvas
 * Ultra-smooth, relaxing celestial wave & stardust bioluminescence
 */

(function () {
  let canvas, ctx;
  let width, height, dpr;
  let particles = [];
  let mouse = { x: -1000, y: -1000, targetX: -1000, targetY: -1000 };
  let time = 0;
  let animId = null;

  function initAmbientAurora() {
    canvas = document.getElementById("ambientAuroraCanvas");
    if (!canvas) return;
    ctx = canvas.getContext("2d");

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMouseMove, { passive: true });

    initParticles();
    animate();
  }

  function resize() {
    if (!canvas) return;
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.resetTransform();
    ctx.scale(dpr, dpr);
  }

  function onMouseMove(e) {
    mouse.targetX = e.clientX;
    mouse.targetY = e.clientY;
  }

  function initParticles() {
    particles = [];
    const count = width < 768 ? 35 : 65;
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        baseRadius: 1.2 + Math.random() * 2.4,
        radius: 1.5,
        color: getRandomColor(),
        vx: (Math.random() - 0.5) * 0.35,
        vy: -0.2 - Math.random() * 0.45,
        pulseSpeed: 0.02 + Math.random() * 0.03,
        pulseOffset: Math.random() * Math.PI * 2,
        alpha: 0.3 + Math.random() * 0.5
      });
    }
  }

  function getRandomColor() {
    const isLight = document.body.classList.contains("theme-light");
    if (isLight) {
      const lightCols = [
        "rgba(2, 132, 199, ",   // Sky Cyan
        "rgba(124, 58, 237, ",  // Violet
        "rgba(5, 150, 105, ",   // Mint Emerald
        "rgba(236, 72, 153, "   // Soft Rose
      ];
      return lightCols[Math.floor(Math.random() * lightCols.length)];
    } else {
      const darkCols = [
        "rgba(0, 240, 255, ",   // Neon Cyan
        "rgba(139, 92, 246, ",  // Radiant Violet
        "rgba(0, 255, 136, ",   // Spring Emerald
        "rgba(244, 114, 182, "  // Soft Pink
      ];
      return darkCols[Math.floor(Math.random() * darkCols.length)];
    }
  }

  function drawAuroraWave(baseY, amplitude, frequency, speed, color1, color2, offset) {
    const isLight = document.body.classList.contains("theme-light");
    const waveGradient = ctx.createLinearGradient(0, baseY - amplitude, width, baseY + amplitude);
    waveGradient.addColorStop(0, color1);
    waveGradient.addColorStop(0.5, color2);
    waveGradient.addColorStop(1, color1);

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(0, height);

    for (let x = 0; x <= width; x += 15) {
      const wave1 = Math.sin(x * frequency + time * speed + offset) * amplitude;
      const wave2 = Math.cos(x * (frequency * 0.5) - time * (speed * 0.7) + offset) * (amplitude * 0.45);
      const y = baseY + wave1 + wave2;
      if (x === 0) ctx.lineTo(x, y);
      else ctx.lineTo(x, y);
    }

    ctx.lineTo(width, height);
    ctx.closePath();

    ctx.fillStyle = waveGradient;
    ctx.globalAlpha = isLight ? 0.08 : 0.16;
    ctx.fill();
    ctx.restore();
  }

  function animate() {
    time += 0.015;
    const isLight = document.body.classList.contains("theme-light");

    // Smooth Mouse Damping
    mouse.x += (mouse.targetX - mouse.x) * 0.06;
    mouse.y += (mouse.targetY - mouse.y) * 0.06;

    ctx.clearRect(0, 0, width, height);

    // 1. Draw Visible Aurora Wave Ribbons
    if (!isLight) {
      drawAuroraWave(height * 0.35, 65, 0.0032, 0.8, "rgba(0, 240, 255, 0.7)", "rgba(139, 92, 246, 0.5)", 0);
      drawAuroraWave(height * 0.65, 80, 0.0024, 0.6, "rgba(139, 92, 246, 0.6)", "rgba(0, 255, 136, 0.45)", Math.PI / 3);
      drawAuroraWave(height * 0.85, 55, 0.0040, 0.9, "rgba(0, 255, 136, 0.5)", "rgba(0, 240, 255, 0.6)", Math.PI);
    } else {
      drawAuroraWave(height * 0.35, 50, 0.0030, 0.8, "rgba(2, 132, 199, 0.6)", "rgba(124, 58, 237, 0.45)", 0);
      drawAuroraWave(height * 0.65, 65, 0.0022, 0.6, "rgba(124, 58, 237, 0.5)", "rgba(5, 150, 105, 0.4)", Math.PI / 3);
      drawAuroraWave(height * 0.85, 45, 0.0035, 0.9, "rgba(5, 150, 105, 0.45)", "rgba(2, 132, 199, 0.5)", Math.PI);
    }

    // 2. Draw Soft Bioluminescent Floating Fireflies
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      // Natural Upward Drift with Horizontal Wave
      p.y += p.vy;
      p.x += p.vx + Math.sin(time * 1.5 + p.pulseOffset) * 0.3;

      // Wrap-around screen boundaries
      if (p.y < -20) { p.y = height + 20; p.x = Math.random() * width; }
      if (p.x < -20) p.x = width + 20;
      if (p.x > width + 20) p.x = -20;

      // Mouse Gentle Repel / Attraction
      const dx = mouse.x - p.x;
      const dy = mouse.y - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 140) {
        const force = (1 - dist / 140) * 1.2;
        p.x -= (dx / dist) * force;
        p.y -= (dy / dist) * force;
      }

      // Sinusoidal Glow Pulse
      const pulse = Math.sin(time * 2 + p.pulseOffset);
      p.radius = p.baseRadius + pulse * 0.6;
      const currentAlpha = Math.max(0.1, p.alpha + pulse * 0.25);

      // Render Soft Glow Particle
      ctx.save();
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color + currentAlpha + ")";
      ctx.shadowBlur = isLight ? 6 : 14;
      ctx.shadowColor = p.color + "0.8)";
      ctx.fill();
      ctx.restore();
    }

    animId = requestAnimationFrame(animate);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAmbientAurora);
  } else {
    initAmbientAurora();
  }
})();
