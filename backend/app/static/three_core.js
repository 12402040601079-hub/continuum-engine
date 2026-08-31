/**
 * Continuum Engine - Three.js 3D Magnetic Quantum Vault Reactor & Particle Matrix
 */

class Quantum3DEngine {
  constructor() {
    this.container = null;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    
    // 3D Objects
    this.reactorCore = null;
    this.innerSphere = null;
    this.outerGimbal1 = null;
    this.outerGimbal2 = null;
    this.outerGimbal3 = null;
    this.particleCloud = null;
    this.particlePositions = null;
    this.particleColors = null;
    this.corePointLight = null;
    this.ambientLight = null;
    this.dirLight1 = null;
    this.dirLight2 = null;
    this.groundGrid = null;
    
    // Animation state
    this.rotationSpeed = 0.008;
    this.targetRotationSpeed = 0.008;
    this.particleCount = 3500;
    this.isCrashing = false;
    this.isLightMode = false;
    this.coreColor = new THREE.Color(0x00f0ff);
    this.targetCoreColor = new THREE.Color(0x00f0ff);
    
    // Magnetic Mouse Interaction
    this.mouseX = 0;
    this.mouseY = 0;
    this.targetCameraX = 0;
    this.targetCameraY = 4;
    this.targetCameraZ = 20;
    
    this.clock = new THREE.Clock();
  }

  init(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    // 1. Scene Setup
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x060b14, 0.022);

    // 2. Camera Setup
    const aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(55, aspect, 0.1, 1000);
    this.camera.position.set(0, 4, 20);

    // 3. WebGL Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.25;
    this.container.appendChild(this.renderer.domElement);

    // 4. Luminous Magnetic Lighting
    this.ambientLight = new THREE.AmbientLight(0x1a233a, 1.8);
    this.scene.add(this.ambientLight);

    this.corePointLight = new THREE.PointLight(0x00f0ff, 4.5, 38);
    this.corePointLight.position.set(0, 0, 0);
    this.scene.add(this.corePointLight);

    this.dirLight1 = new THREE.DirectionalLight(0x00f0ff, 1.4);
    this.dirLight1.position.set(12, 22, 12);
    this.scene.add(this.dirLight1);

    this.dirLight2 = new THREE.DirectionalLight(0x9d4edd, 1.0);
    this.dirLight2.position.set(-12, -12, -12);
    this.scene.add(this.dirLight2);

    // 5. Build 3D Objects
    this.buildQuantumReactorCore();
    this.buildParticleMatrix();
    this.buildCyberGrid();

    // 6. Event Listeners
    window.addEventListener("resize", () => this.onWindowResize());
    window.addEventListener("mousemove", (e) => this.onMouseMove(e));

    // 7. Start Render Loop
    this.animate();
    console.log("⚡ Three.js Magnetic Quantum Vault Reactor initialized.");
  }

  /**
   * Constructs the multi-layered geometric Quantum Vault Reactor Core
   */
  buildQuantumReactorCore() {
    this.reactorCore = new THREE.Group();

    // A. Inner Pulsing Crystal Core (Icosahedron)
    const coreGeo = new THREE.IcosahedronGeometry(2.3, 1);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x00f0ff,
      emissive: 0x0088ff,
      emissiveIntensity: 0.85,
      roughness: 0.15,
      metalness: 0.95,
      wireframe: true,
      transparent: true,
      opacity: 0.88
    });
    this.innerSphere = new THREE.Mesh(coreGeo, coreMat);
    this.reactorCore.add(this.innerSphere);

    // B. Inner Solid Radiant Core
    const solidGeo = new THREE.OctahedronGeometry(1.4, 2);
    const solidMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      wireframe: false
    });
    const solidCore = new THREE.Mesh(solidGeo, solidMat);
    this.reactorCore.add(solidCore);

    // C. Concentric Magnetic Gimbal Ring 1
    const ring1Geo = new THREE.TorusGeometry(3.6, 0.08, 16, 120);
    const ring1Mat = new THREE.MeshStandardMaterial({
      color: 0x00f0ff,
      emissive: 0x00f0ff,
      emissiveIntensity: 0.7,
      metalness: 0.9,
      roughness: 0.1
    });
    this.outerGimbal1 = new THREE.Mesh(ring1Geo, ring1Mat);
    this.reactorCore.add(this.outerGimbal1);

    // D. Concentric Magnetic Gimbal Ring 2
    const ring2Geo = new THREE.TorusGeometry(4.7, 0.06, 16, 120);
    const ring2Mat = new THREE.MeshStandardMaterial({
      color: 0x9d4edd,
      emissive: 0x9d4edd,
      emissiveIntensity: 0.6,
      metalness: 0.9,
      roughness: 0.1
    });
    this.outerGimbal2 = new THREE.Mesh(ring2Geo, ring2Mat);
    this.outerGimbal2.rotation.x = Math.PI / 3;
    this.reactorCore.add(this.outerGimbal2);

    // E. Concentric Magnetic Gimbal Ring 3 (Outer Aurora Cage)
    const ring3Geo = new THREE.TorusGeometry(5.9, 0.05, 16, 120);
    const ring3Mat = new THREE.MeshStandardMaterial({
      color: 0x00ffcc,
      emissive: 0x00ffcc,
      emissiveIntensity: 0.5,
      metalness: 0.8,
      roughness: 0.2
    });
    this.outerGimbal3 = new THREE.Mesh(ring3Geo, ring3Mat);
    this.outerGimbal3.rotation.y = Math.PI / 4;
    this.reactorCore.add(this.outerGimbal3);

    this.scene.add(this.reactorCore);
  }

  /**
   * Constructs the 3D reactive magnetic particle matrix
   */
  buildParticleMatrix() {
    if (this.particleCloud) {
      this.scene.remove(this.particleCloud);
    }

    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(this.particleCount * 3);
    const colors = new Float32Array(this.particleCount * 3);

    // Light mode vs Dark mode particle color harmonies
    const baseColor = this.isLightMode ? new THREE.Color(0x2563eb) : new THREE.Color(0x00f0ff);
    const altColor = this.isLightMode ? new THREE.Color(0x7c3aed) : new THREE.Color(0x9d4edd);
    const tealColor = this.isLightMode ? new THREE.Color(0x0d9488) : new THREE.Color(0x00ffcc);

    for (let i = 0; i < this.particleCount; i++) {
      const radius = 7 + Math.random() * 24;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);

      const mixedColor = Math.random() > 0.5 
        ? baseColor.clone().lerp(altColor, Math.random()) 
        : baseColor.clone().lerp(tealColor, Math.random());

      colors[i * 3] = mixedColor.r;
      colors[i * 3 + 1] = mixedColor.g;
      colors[i * 3 + 2] = mixedColor.b;
    }

    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    // Custom Particle Texture
    const canvas = document.createElement("canvas");
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext("2d");
    const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    
    if (this.isLightMode) {
      grad.addColorStop(0, "rgba(37, 99, 235, 1)");
      grad.addColorStop(0.35, "rgba(124, 58, 237, 0.85)");
      grad.addColorStop(1, "rgba(255, 255, 255, 0)");
    } else {
      grad.addColorStop(0, "rgba(255,255,255,1)");
      grad.addColorStop(0.25, "rgba(0,240,255,0.9)");
      grad.addColorStop(0.65, "rgba(157,78,221,0.5)");
      grad.addColorStop(1, "rgba(0,0,0,0)");
    }
    
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 32, 32);

    const texture = new THREE.CanvasTexture(canvas);

    const mat = new THREE.PointsMaterial({
      size: this.isLightMode ? 0.32 : 0.38,
      vertexColors: true,
      map: texture,
      transparent: true,
      blending: this.isLightMode ? THREE.NormalBlending : THREE.AdditiveBlending,
      opacity: this.isLightMode ? 0.65 : 1.0,
      depthWrite: false
    });

    this.particlePositions = positions;
    this.particleColors = colors;
    this.particleCloud = new THREE.Points(geo, mat);
    this.scene.add(this.particleCloud);
  }

  /**
   * Constructs bottom floating cyber grid
   */
  buildCyberGrid() {
    if (this.groundGrid) {
      this.scene.remove(this.groundGrid);
    }

    const gridColor1 = this.isLightMode ? 0x94a3b8 : 0x00f0ff;
    const gridColor2 = this.isLightMode ? 0xe2e8f0 : 0x1e293b;

    const gridHelper = new THREE.GridHelper(64, 44, gridColor1, gridColor2);
    gridHelper.position.y = -7.5;
    gridHelper.material.transparent = true;
    gridHelper.material.opacity = this.isLightMode ? 0.45 : 0.35;
    this.groundGrid = gridHelper;
    this.scene.add(gridHelper);
  }

  /**
   * Animation & Render Loop
   */
  animate() {
    requestAnimationFrame(() => this.animate());

    const elapsed = this.clock.getElapsedTime();

    // Smooth speed interpolation
    this.rotationSpeed += (this.targetRotationSpeed - this.rotationSpeed) * 0.05;

    // Smooth color interpolation
    this.coreColor.lerp(this.targetCoreColor, 0.08);
    if (this.innerSphere) {
      this.innerSphere.material.color.copy(this.coreColor);
      this.innerSphere.material.emissive.copy(this.coreColor);
    }
    if (this.corePointLight) {
      this.corePointLight.color.copy(this.coreColor);
    }

    // 1. Rotate Reactor Core & Magnetic Gimbals
    if (this.reactorCore) {
      this.reactorCore.position.y = Math.sin(elapsed * 1.6) * 0.4;
      this.innerSphere.rotation.x += this.rotationSpeed;
      this.innerSphere.rotation.y += this.rotationSpeed * 1.2;

      this.outerGimbal1.rotation.x += this.rotationSpeed * 1.5;
      this.outerGimbal1.rotation.y += this.rotationSpeed * 0.7;

      this.outerGimbal2.rotation.y += this.rotationSpeed * 1.8;
      this.outerGimbal2.rotation.z += this.rotationSpeed * 0.9;

      this.outerGimbal3.rotation.z += this.rotationSpeed * 1.3;
      this.outerGimbal3.rotation.x += this.rotationSpeed * 1.1;
    }

    // 2. Magnetic Particle Attraction towards Mouse Position
    if (this.particleCloud && this.particlePositions && !this.isCrashing) {
      const positions = this.particleCloud.geometry.attributes.position.array;
      const targetX = this.mouseX * 6;
      const targetY = -this.mouseY * 4;

      for (let i = 0; i < this.particleCount; i++) {
        const dx = targetX - positions[i * 3];
        const dy = targetY - positions[i * 3 + 1];
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 15) {
          positions[i * 3] += (dx / dist) * 0.015;
          positions[i * 3 + 1] += (dy / dist) * 0.015;
        }
      }
      this.particleCloud.geometry.attributes.position.needsUpdate = true;
      this.particleCloud.rotation.y += this.rotationSpeed * 0.2;
      this.particleCloud.rotation.x = Math.sin(elapsed * 0.3) * 0.1;
    }

    // 3. Move Cyber Ground Grid
    if (this.groundGrid) {
      this.groundGrid.position.z = (elapsed * 2.2) % 3 - 7.5;
    }

    // 4. Parallax Camera Damping
    this.camera.position.x += (this.targetCameraX + this.mouseX * 3.5 - this.camera.position.x) * 0.05;
    this.camera.position.y += (this.targetCameraY - this.mouseY * 2.5 - this.camera.position.y) * 0.05;
    this.camera.lookAt(0, 0, 0);

    this.renderer.render(this.scene, this.camera);
  }

  /**
   * Keystroke micro-pulse reaction
   */
  triggerKeystrokeReaction() {
    this.targetRotationSpeed = 0.035;
    setTimeout(() => {
      this.targetRotationSpeed = 0.008;
    }, 200);

    if (this.corePointLight) {
      this.corePointLight.intensity = this.isLightMode ? 6 : 8.5;
      setTimeout(() => {
        this.corePointLight.intensity = this.isLightMode ? 3 : 4.5;
      }, 150);
    }
  }

  /**
   * Wizard Step advance reaction
   */
  triggerStepReaction(step) {
    const darkColors = [0x00f0ff, 0x9d4edd, 0x00ffcc, 0xf59e0b];
    const lightColors = [0x0284c7, 0x7c3aed, 0x0d9488, 0xd97706];
    
    const palette = this.isLightMode ? lightColors : darkColors;
    this.targetCoreColor.setHex(palette[step - 1] || palette[0]);
    this.targetRotationSpeed = 0.045;
    setTimeout(() => {
      this.targetRotationSpeed = 0.008;
    }, 600);
  }

  /**
   * 404 Stale Asset Crash Explosion
   */
  triggerCrashExplosion() {
    this.isCrashing = true;
    this.targetCoreColor.setHex(0xe11d48);
    this.targetRotationSpeed = 0.09;
    if (this.corePointLight) this.corePointLight.intensity = 16;

    if (this.particleCloud && this.particlePositions) {
      const positions = this.particleCloud.geometry.attributes.position.array;
      for (let i = 0; i < this.particleCount; i++) {
        positions[i * 3] *= 1.6;
        positions[i * 3 + 1] *= 1.6;
        positions[i * 3 + 2] *= 1.6;
      }
      this.particleCloud.geometry.attributes.position.needsUpdate = true;
    }
  }

  /**
   * Rehydration particle implosion & core stabilization
   */
  triggerRehydrateImplosion() {
    this.isCrashing = false;
    this.targetCoreColor.setHex(this.isLightMode ? 0x0284c7 : 0x00f0ff);
    this.targetRotationSpeed = 0.008;
    if (this.corePointLight) this.corePointLight.intensity = this.isLightMode ? 3 : 4.5;

    this.buildParticleMatrix();
  }

  /**
   * Adjusts scene fog, materials, lighting, and particles for Light / Dark mode
   */
  setThemeMode(isLight) {
    this.isLightMode = isLight;
    if (this.scene) {
      this.scene.fog.color.setHex(isLight ? 0xf8fafc : 0x060b14);
      this.scene.fog.density = isLight ? 0.015 : 0.022;

      if (this.ambientLight) {
        this.ambientLight.color.setHex(isLight ? 0xffffff : 0x1a233a);
        this.ambientLight.intensity = isLight ? 2.2 : 1.8;
      }
      if (this.dirLight1) {
        this.dirLight1.color.setHex(isLight ? 0x2563eb : 0x00f0ff);
      }
      if (this.dirLight2) {
        this.dirLight2.color.setHex(isLight ? 0x7c3aed : 0x9d4edd);
      }

      this.targetCoreColor.setHex(isLight ? 0x0284c7 : 0x00f0ff);
      this.buildParticleMatrix();
      this.buildCyberGrid();
    }
  }

  /**
   * Camera View Preset Switches
   */
  setCameraPreset(preset) {
    switch (preset) {
      case "core":
        this.targetCameraX = 0;
        this.targetCameraY = 2;
        this.targetCameraZ = 12;
        break;
      case "matrix":
        this.targetCameraX = 14;
        this.targetCameraY = 10;
        this.targetCameraZ = 24;
        break;
      case "radar":
        this.targetCameraX = 0;
        this.targetCameraY = 22;
        this.targetCameraZ = 6;
        break;
      default:
        this.targetCameraX = 0;
        this.targetCameraY = 4;
        this.targetCameraZ = 20;
    }
  }

  onMouseMove(e) {
    this.mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    this.mouseY = (e.clientY / window.innerHeight) * 2 - 1;
  }

  onWindowResize() {
    if (!this.container || !this.renderer || !this.camera) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }
}

// Global 3D Engine Singleton
window.quantum3D = new Quantum3DEngine();
