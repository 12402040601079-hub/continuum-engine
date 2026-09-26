/**
 * Continuum Engine - Eye-Comforting Quantum Aurora & Floating Ether Engine
 * Elegant, Soothing 3D WebGL Background System (Zero Eye Strain, High Performance)
 */

class Quantum3DEngine {
  constructor() {
    this.container = null;
    this.scene = null;
    this.camera = null;
    this.renderer = null;

    // 3D Objects
    this.vortexGroup = null;
    this.coreCrystal = null;
    this.innerSolidCore = null;
    this.gimbalRings = [];
    this.plasmaNodes = [];
    this.connectionSegments = null;
    this.packetMeshes = [];
    this.packetPaths = [];
    this.shockwaveMesh = null;
    this.ambientLight = null;
    this.corePointLight = null;
    this.secondaryPointLight = null;
    this.cyberGrid = null;

    // State & Particles
    const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
    this.isMobile = isMobile;
    this.nodeCount = isMobile ? 35 : 75;
    this.packetCount = isMobile ? 18 : 45;
    this.nodes = [];
    this.connections = [];
    this.mode = 'synaptic'; // 'synaptic' | 'hexgrid' | 'streamers' | 'constellation'
    this.isCrashing = false;
    this.isLightMode = false;

    // Harmonious Palette
    this.colorCyan = new THREE.Color(0x00f0ff);
    this.colorViolet = new THREE.Color(0x8b5cf6);
    this.colorMagenta = new THREE.Color(0xec4899);
    this.colorEmerald = new THREE.Color(0x10b981);
    this.colorAmber = new THREE.Color(0xf59e0b);
    this.currentColor = new THREE.Color(0x00f0ff);
    this.targetColor = new THREE.Color(0x00f0ff);

    // Mouse Damping
    this.mouseX = 0;
    this.mouseY = 0;
    this.targetMouseX = 0;
    this.targetMouseY = 0;
    this.clickShockwaves = [];

    // Scroll-Flight Camera Parallax
    this.scrollY = 0;
    this.scrollVelocity = 0;
    this.baseCamZ = 22;
    this.camRotationSpeed = 0.0025;
    this.targetRotationSpeed = 0.0025;

    this.clock = new THREE.Clock();
  }

  init(containerId) {
    this.container = document.getElementById(containerId) || document.getElementById('three-canvas') || document.getElementById('threeCanvasContainer');
    if (!this.container) return;

    if (this.container.querySelector('canvas')) {
      return;
    }

    const w = this.container.clientWidth || window.innerWidth;
    const h = this.container.clientHeight || window.innerHeight;

    // 1. Scene & Eye-Comfort Volumetric Fog
    this.scene = new THREE.Scene();
    const fogColor = this.isLightMode ? 0xf8fafc : 0x050713;
    this.scene.fog = new THREE.FogExp2(fogColor, 0.016);

    // 2. Camera Setup
    this.camera = new THREE.PerspectiveCamera(54, w / h, 0.1, 1000);
    this.camera.position.set(0, 1.5, this.baseCamZ);

    // 3. WebGL Renderer with Soft Tone Mapping
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance"
    });
    this.renderer.setSize(w, h);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, this.isMobile ? 1.25 : 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.container.appendChild(this.renderer.domElement);

    // 4. Ambient & Point Lighting
    this.ambientLight = new THREE.AmbientLight(this.isLightMode ? 0xffffff : 0x0d1527, 2.2);
    this.scene.add(this.ambientLight);

    this.corePointLight = new THREE.PointLight(0x00f0ff, 2.8, 42);
    this.corePointLight.position.set(0, 0, 0);
    this.scene.add(this.corePointLight);

    this.secondaryPointLight = new THREE.PointLight(0x8b5cf6, 2.0, 36);
    this.secondaryPointLight.position.set(10, 12, -8);
    this.scene.add(this.secondaryPointLight);

    // 5. Build Soft Quantum Core & Ether Web
    this.buildQuantumVortexCore();
    this.buildSynapticPlasmaWeb();
    this.buildCyberGridFloor();

    // 6. Event Listeners
    window.addEventListener("resize", () => this.onWindowResize());
    window.addEventListener("mousemove", (e) => this.onMouseMove(e));
    window.addEventListener("click", (e) => this.onClick(e));
    window.addEventListener("scroll", () => this.onWindowScroll(), { passive: true });

    // 7. Render Loop
    this.animate();
  }

  /**
   * Constructs a soothing, elegant Quantum Core with a soft breathing halo
   */
  buildQuantumVortexCore() {
    this.vortexGroup = new THREE.Group();

    // A. Soft Central Ether Sphere
    const crystalGeo = new THREE.IcosahedronGeometry(1.8, 2);
    const crystalMat = new THREE.MeshStandardMaterial({
      color: 0x00f0ff,
      emissive: 0x0066cc,
      emissiveIntensity: 0.65,
      roughness: 0.3,
      metalness: 0.7,
      wireframe: true,
      transparent: true,
      opacity: 0.45
    });
    this.coreCrystal = new THREE.Mesh(crystalGeo, crystalMat);
    this.vortexGroup.add(this.coreCrystal);

    // B. Inner Radiant Soft Core
    const solidGeo = new THREE.SphereGeometry(0.85, 32, 32);
    const solidMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.75
    });
    this.innerSolidCore = new THREE.Mesh(solidGeo, solidMat);
    this.vortexGroup.add(this.innerSolidCore);

    // C. Single Soothing Ambient Ring Halo
    const ringGeo = new THREE.TorusGeometry(3.6, 0.04, 16, 100);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0x8b5cf6,
      emissive: 0x8b5cf6,
      emissiveIntensity: 0.5,
      metalness: 0.8,
      roughness: 0.2,
      transparent: true,
      opacity: 0.4
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 4;
    this.gimbalRings = [ring];
    this.vortexGroup.add(ring);

    this.scene.add(this.vortexGroup);
  }

  /**
   * Constructs soft floating particles and clean, non-distracting connections
   */
  buildSynapticPlasmaWeb() {
    this.nodes = [];
    this.plasmaNodes = [];
    this.packetMeshes = [];
    this.packetPaths = [];

    const spreadX = this.isMobile ? 22 : 40;
    const spreadY = this.isMobile ? 16 : 28;
    const spreadZ = this.isMobile ? 14 : 24;

    for (let i = 0; i < this.nodeCount; i++) {
      const isHub = i < 8;
      const x = isHub ? (Math.random() - 0.5) * 14 : (Math.random() - 0.5) * spreadX;
      const y = isHub ? (Math.random() - 0.5) * 10 : (Math.random() - 0.5) * spreadY;
      const z = isHub ? (Math.random() - 0.5) * 8 : (Math.random() - 0.5) * spreadZ;

      const nodeData = {
        pos: new THREE.Vector3(x, y, z),
        origPos: new THREE.Vector3(x, y, z),
        isHub: isHub,
        pulseOffset: Math.random() * Math.PI * 2,
        neighbors: []
      };
      this.nodes.push(nodeData);

      const radius = isHub ? 0.35 : 0.12 + Math.random() * 0.1;
      const geo = new THREE.SphereGeometry(radius, 16, 16);
      
      const colPalette = [0x00f0ff, 0x8b5cf6, 0x10b981];
      const col = colPalette[i % colPalette.length];

      const mat = new THREE.MeshStandardMaterial({
        color: col,
        emissive: col,
        emissiveIntensity: isHub ? 0.75 : 0.4,
        roughness: 0.3,
        metalness: 0.6,
        transparent: true,
        opacity: isHub ? 0.8 : 0.5
      });

      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.copy(nodeData.pos);
      this.plasmaNodes.push(mesh);
      this.scene.add(mesh);
    }

    // Clean, subtle filament connections
    const maxDist = this.isMobile ? 7.5 : 8.5;
    const linePositions = [];
    const lineColors = [];
    this.connections = [];

    for (let i = 0; i < this.nodes.length; i++) {
      for (let j = i + 1; j < this.nodes.length; j++) {
        const d = this.nodes[i].pos.distanceTo(this.nodes[j].pos);
        if (d < maxDist) {
          this.nodes[i].neighbors.push(j);
          this.nodes[j].neighbors.push(i);
          this.connections.push({ a: i, b: j, dist: d });

          linePositions.push(this.nodes[i].pos.x, this.nodes[i].pos.y, this.nodes[i].pos.z);
          linePositions.push(this.nodes[j].pos.x, this.nodes[j].pos.y, this.nodes[j].pos.z);

          const c = this.colorCyan;
          lineColors.push(c.r, c.g, c.b);
          lineColors.push(c.r, c.g, c.b);
        }
      }
    }

    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
    lineGeo.setAttribute('color', new THREE.Float32BufferAttribute(lineColors, 3));

    const lineMat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.16,
      blending: THREE.AdditiveBlending
    });

    this.connectionSegments = new THREE.LineSegments(lineGeo, lineMat);
    this.scene.add(this.connectionSegments);

    // Soft traveling energy sparks
    const packetGeo = new THREE.SphereGeometry(0.1, 8, 8);
    for (let p = 0; p < this.packetCount; p++) {
      if (this.connections.length === 0) break;
      const conn = this.connections[p % this.connections.length];
      const pMat = new THREE.MeshBasicMaterial({
        color: 0x00f0ff,
        transparent: true,
        opacity: 0.6
      });
      const pMesh = new THREE.Mesh(packetGeo, pMat);
      this.packetMeshes.push(pMesh);
      this.packetPaths.push({
        nodeA: conn.a,
        nodeB: conn.b,
        progress: Math.random(),
        speed: 0.003 + Math.random() * 0.006
      });
      this.scene.add(pMesh);
    }
  }

  /**
   * Constructs subtle, non-intrusive floor grid
   */
  buildCyberGridFloor() {
    if (this.cyberGrid) this.scene.remove(this.cyberGrid);

    const gridColor1 = this.isLightMode ? 0x0284c7 : 0x00f0ff;
    const gridColor2 = this.isLightMode ? 0xcbd5e1 : 0x0c1328;

    const gridHelper = new THREE.GridHelper(80, 40, gridColor1, gridColor2);
    gridHelper.position.y = -8.5;
    gridHelper.material.transparent = true;
    gridHelper.material.opacity = this.isLightMode ? 0.14 : 0.12;
    this.cyberGrid = gridHelper;
    this.scene.add(gridHelper);
  }

  /**
   * Render Loop
   */
  animate() {
    requestAnimationFrame(() => this.animate());

    const delta = this.clock.getDelta();
    const elapsed = this.clock.getElapsedTime();

    // Smooth speed interpolation
    this.camRotationSpeed += (this.targetRotationSpeed - this.camRotationSpeed) * 0.04;

    // Relaxing 60 BPM sinusoidal breathing pulse
    const heartbeat = (Math.sin(elapsed * 3.14) + 1) * 0.5;

    // Smooth Color Transitions
    this.currentColor.lerp(this.targetColor, 0.04);
    if (this.corePointLight) {
      this.corePointLight.color.copy(this.currentColor);
      this.corePointLight.intensity = 2.4 + heartbeat * 0.6;
    }
    if (this.coreCrystal) {
      this.coreCrystal.material.color.copy(this.currentColor);
    }

    // Gentle Floating Motion for Core
    if (this.vortexGroup) {
      this.vortexGroup.position.y = Math.sin(elapsed * 0.8) * 0.25;
      this.coreCrystal.rotation.y += this.camRotationSpeed * 0.8;
      this.coreCrystal.rotation.x += this.camRotationSpeed * 0.4;

      if (this.gimbalRings.length > 0) {
        this.gimbalRings[0].rotation.z += this.camRotationSpeed * 0.5;
      }
    }

    // Mouse Smooth Damping
    this.mouseX += (this.targetMouseX - this.mouseX) * 0.05;
    this.mouseY += (this.targetMouseY - this.mouseY) * 0.05;

    // Gentle Node Float
    const posAttr = this.connectionSegments ? this.connectionSegments.geometry.attributes.position : null;
    let lineIdx = 0;

    for (let i = 0; i < this.nodes.length; i++) {
      const node = this.nodes[i];
      const mesh = this.plasmaNodes[i];

      node.pos.x = node.origPos.x + Math.sin(elapsed * 0.5 + node.pulseOffset) * 0.4;
      node.pos.y = node.origPos.y + Math.cos(elapsed * 0.4 + node.pulseOffset) * 0.35;
      node.pos.z = node.origPos.z + Math.sin(elapsed * 0.3 + node.pulseOffset) * 0.3;

      mesh.position.copy(node.pos);
      const scale = node.isHub ? 1.0 + heartbeat * 0.12 : 0.9 + heartbeat * 0.08;
      mesh.scale.set(scale, scale, scale);
    }

    if (posAttr) {
      for (let c = 0; c < this.connections.length; c++) {
        const conn = this.connections[c];
        const posA = this.nodes[conn.a].pos;
        const posB = this.nodes[conn.b].pos;
        posAttr.setXYZ(lineIdx++, posA.x, posA.y, posA.z);
        posAttr.setXYZ(lineIdx++, posB.x, posB.y, posB.z);
      }
      posAttr.needsUpdate = true;
    }

    // Packet Motion
    for (let p = 0; p < this.packetMeshes.length; p++) {
      const pMesh = this.packetMeshes[p];
      const path = this.packetPaths[p];
      path.progress += path.speed;
      if (path.progress > 1.0) {
        path.progress = 0.0;
        const currNode = this.nodes[path.nodeB];
        if (currNode && currNode.neighbors.length > 0) {
          path.nodeA = path.nodeB;
          path.nodeB = currNode.neighbors[Math.floor(Math.random() * currNode.neighbors.length)];
        }
      }
      const pA = this.nodes[path.nodeA].pos;
      const pB = this.nodes[path.nodeB].pos;
      pMesh.position.lerpVectors(pA, pB, path.progress);
    }

    // Shockwaves
    for (let s = this.clickShockwaves.length - 1; s >= 0; s--) {
      const sw = this.clickShockwaves[s];
      sw.radius += delta * 12;
      sw.opacity -= delta * 1.2;
      sw.mesh.scale.set(sw.radius, sw.radius, 1);
      sw.mesh.material.opacity = Math.max(0, sw.opacity);
      if (sw.opacity <= 0) {
        this.scene.remove(sw.mesh);
        this.clickShockwaves.splice(s, 1);
      }
    }

    // Gentle Grid Motion
    if (this.cyberGrid) {
      this.cyberGrid.position.z = (elapsed * 1.2) % 3 - 8.5;
    }

    // Parallax Camera Smooth Easing
    const targetY = 1.5 - (this.scrollY * 0.002);
    const targetZ = this.baseCamZ;

    this.camera.position.x += (this.mouseX * 2.5 - this.camera.position.x) * 0.04;
    this.camera.position.y += (targetY - this.mouseY * 2.0 - this.camera.position.y) * 0.04;
    this.camera.position.z += (targetZ - this.camera.position.z) * 0.04;
    this.camera.lookAt(0, targetY * 0.4, 0);

    this.renderer.render(this.scene, this.camera);
  }

  onMouseMove(e) {
    this.targetMouseX = (e.clientX / window.innerWidth) * 2 - 1;
    this.targetMouseY = (e.clientY / window.innerHeight) * 2 - 1;
  }

  onClick(e) {
    const x = (e.clientX / window.innerWidth) * 2 - 1;
    const y = (e.clientY / window.innerHeight) * 2 - 1;
    const ringGeo = new THREE.RingGeometry(0.1, 0.3, 36);
    const ringMat = new THREE.MeshBasicMaterial({
      color: this.isLightMode ? 0x0284c7 : 0x00f0ff,
      transparent: true,
      opacity: 0.6,
      side: THREE.DoubleSide
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.position.set(x * 12, -y * 9, 0);
    this.scene.add(ringMesh);

    this.clickShockwaves.push({
      mesh: ringMesh,
      radius: 0.4,
      opacity: 0.6
    });
  }

  onWindowScroll() {
    this.scrollY = window.pageYOffset || document.documentElement.scrollTop;
  }

  onWindowResize() {
    if (!this.container || !this.renderer || !this.camera) return;
    const w = this.container.clientWidth || window.innerWidth;
    const h = this.container.clientHeight || window.innerHeight;
    this.isMobile = window.innerWidth <= 768;

    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, this.isMobile ? 1.25 : 2));
  }

  setMode(mode) {
    this.mode = mode;
    if (mode === 'hexgrid') {
      this.targetColor.setHex(this.isLightMode ? 0x059669 : 0x10b981);
    } else if (mode === 'streamers') {
      this.targetColor.setHex(this.isLightMode ? 0x7c3aed : 0x8b5cf6);
    } else if (mode === 'constellation') {
      this.targetColor.setHex(this.isLightMode ? 0xd97706 : 0xf59e0b);
    } else {
      this.targetColor.setHex(this.isLightMode ? 0x0284c7 : 0x00f0ff);
    }
  }

  triggerKeystrokeReaction() {
    this.targetRotationSpeed = 0.012;
    setTimeout(() => {
      this.targetRotationSpeed = 0.0025;
    }, 200);
  }

  triggerStepReaction(step) {
    const palette = [0x00f0ff, 0x8b5cf6, 0xec4899, 0x10b981];
    const col = palette[(step - 1) % palette.length];
    this.targetColor.setHex(col);
  }

  triggerCrashExplosion() {
    this.isCrashing = true;
    this.targetColor.setHex(0xef4444);
  }

  triggerCrashVisuals() {
    this.triggerCrashExplosion();
  }

  triggerRehydrateImplosion() {
    this.isCrashing = false;
    this.targetColor.setHex(0x10b981);
    setTimeout(() => {
      this.targetColor.setHex(0x00f0ff);
    }, 2500);
  }

  setThemeMode(isLight) {
    this.isLightMode = isLight;
    if (this.scene) {
      const fogColor = isLight ? 0xf8fafc : 0x050713;
      this.scene.fog.color.setHex(fogColor);
      this.scene.fog.density = isLight ? 0.014 : 0.016;
      if (this.ambientLight) {
        this.ambientLight.color.setHex(isLight ? 0xffffff : 0x0d1527);
        this.ambientLight.intensity = isLight ? 2.6 : 2.2;
      }
      this.buildCyberGridFloor();
    }
  }

  setCameraPreset(preset) {
    switch (preset) {
      case "core":
        this.baseCamZ = 14; break;
      case "matrix":
        this.baseCamZ = 26; break;
      default:
        this.baseCamZ = 22;
    }
  }
}

// Global Singleton
window.quantum3D = new Quantum3DEngine();
window.initDreamCanvas = function(id) {
  window.quantum3D.init(id);
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Quantum3DEngine };
}
