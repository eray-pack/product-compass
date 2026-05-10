import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

interface BrainLoadingScreenProps {
  onDone: () => void;
}

// ─── Geometry helpers ────────────────────────────────────────────────────────

/**
 * Displace sphere vertices with abs(sin) waves.
 * abs(sin) creates SHARP troughs (sulci) and ROUNDED ridges (gyri) —
 * much more brain-like than plain sine.
 */
function displaceSphere(geo: THREE.SphereGeometry, amp: number, seed: number) {
  const pos = geo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const len = Math.sqrt(x * x + y * y + z * z) || 1;
    const nx = x / len;
    const ny = y / len;
    const nz = z / len;

    // Low-freq abs(sin) → large gyri folds
    const largeFolds =
      amp * 1.00 * (Math.abs(Math.sin(nx * 4.8 + ny * 3.9 + seed)) - 0.5) +
      amp * 0.90 * (Math.abs(Math.sin(nz * 5.7 - nx * 4.4 + seed * 1.5)) - 0.5) +
      amp * 0.75 * (Math.abs(Math.sin(ny * 6.9 + nz * 5.1 + seed * 2.3)) - 0.5);

    // Mid-freq → secondary folds
    const midFolds =
      amp * 0.55 * Math.sin(nx * 9.8 + ny * 7.6 + seed * 0.8) +
      amp * 0.40 * Math.sin(nz * 11.3 - ny * 8.5 + seed * 1.9) +
      amp * 0.30 * Math.cos(nx * 13.5 + nz * 10.2 + seed * 3.1);

    // High-freq → fine texture
    const fine =
      amp * 0.18 * Math.sin(ny * 17.4 + nx * 14.1 + seed * 2.7) +
      amp * 0.12 * Math.cos(nz * 20.6 - nx * 16.3 + seed * 1.2);

    const r = len + largeFolds + midFolds + fine;
    pos.setXYZ(i, nx * r, ny * r, nz * r);
  }
  pos.needsUpdate = true;
  geo.computeVertexNormals();
}

/**
 * Generate a neural-fiber arc on/near a hemisphere surface.
 * Points walk along a great-circle with random perturbation.
 */
function makeSurfacePath(hemiCx: number, radius: number): THREE.CatmullRomCurve3 {
  const center = new THREE.Vector3(hemiCx, 0, 0);
  const nPts = 5 + Math.floor(Math.random() * 5); // 5-9 control points
  const pts: THREE.Vector3[] = [];

  // Start somewhere on the front-facing hemisphere (z > 0 bias)
  let phi = 0.5 + Math.random() * 2.1; // [0.5, 2.6] — avoids poles
  let theta = -Math.PI * 0.55 + Math.random() * Math.PI * 1.1;

  const dphi = (Math.random() - 0.5) * 0.38;
  const dtheta = (Math.random() > 0.5 ? 1 : -1) * (0.22 + Math.random() * 0.48);

  for (let i = 0; i < nPts; i++) {
    phi = Math.max(0.3, Math.min(Math.PI * 0.85, phi + dphi));
    theta += dtheta;

    // Spherical → Cartesian (y = up in Three.js)
    const dir = new THREE.Vector3(
      Math.sin(phi) * Math.cos(theta),
      Math.cos(phi),
      Math.sin(phi) * Math.sin(theta),
    );

    // Sit just outside the displaced surface (+3% + tiny jitter)
    const offset = radius * 1.032 + Math.random() * 0.025;
    pts.push(center.clone().add(dir.multiplyScalar(offset)));
  }

  return new THREE.CatmullRomCurve3(pts);
}

/**
 * Build one glowing neural pathway: 3 concentric tubes (core + 2 halo layers).
 * AdditiveBlending on the halos fakes a bloom glow without post-processing.
 */
interface Pathway {
  core: THREE.MeshBasicMaterial;
  mid: THREE.MeshBasicMaterial;
  outer: THREE.MeshBasicMaterial;
  activateAt: number;
}

function makeTubePathway(
  curve: THREE.CatmullRomCurve3,
  parent: THREE.Group,
  activateAt: number,
): Pathway {
  const addTube = (radius: number, mat: THREE.MeshBasicMaterial) => {
    const geo = new THREE.TubeGeometry(curve, 28, radius, 5, false);
    parent.add(new THREE.Mesh(geo, mat));
  };

  const core = new THREE.MeshBasicMaterial({
    color: 0x00bfff,
    transparent: true,
    opacity: 0,
    depthWrite: false,
  });

  const mid = new THREE.MeshBasicMaterial({
    color: 0x00bfff,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const outer = new THREE.MeshBasicMaterial({
    color: 0x0066cc,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  addTube(0.007, core);   // bright core
  addTube(0.020, mid);    // tight glow
  addTube(0.044, outer);  // wide bloom halo

  return { core, mid, outer, activateAt };
}

// ─── Component ───────────────────────────────────────────────────────────────

export function BrainLoadingScreen({ onDone }: BrainLoadingScreenProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [textOpacity, setTextOpacity] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const W = 320;
    const H = 320;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H);
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(44, W / H, 0.1, 100);
    camera.position.set(0, 0.1, 5.0);

    // ── Lighting ─────────────────────────────────────────────────────────────
    // Near-black purple ambient — brain is not black-on-black
    scene.add(new THREE.AmbientLight(0x100820, 3.0));

    // PRIMARY: electric blue rim, hard left-behind → dramatic edge
    const rimBlue = new THREE.PointLight(0x0044ff, 28, 16);
    rimBlue.position.set(-4.0, 0.8, -3.5);
    scene.add(rimBlue);

    // SECONDARY: cyan rim, right-behind → two-sided silhouette
    const rimCyan = new THREE.PointLight(0x00aaff, 16, 14);
    rimCyan.position.set(4.0, -0.5, -3.0);
    scene.add(rimCyan);

    // Very faint purple top-front — just enough to read the gyri contours
    const topFill = new THREE.PointLight(0x5522cc, 4.5, 10);
    topFill.position.set(0, 3.0, 3.5);
    scene.add(topFill);

    // ── Brain mesh ────────────────────────────────────────────────────────────
    const brain = new THREE.Group();
    scene.add(brain);

    const brainMat = () =>
      new THREE.MeshStandardMaterial({
        color: 0x1a0a2e,
        emissive: 0x1a0a2e,
        emissiveIntensity: 0.55,    // self-glow so it's never pitch-black
        roughness: 0.78,
        metalness: 0.04,
      });

    // Left hemisphere
    const leftGeo = new THREE.SphereGeometry(0.92, 80, 56);
    leftGeo.scale(0.96, 0.93, 0.97);
    displaceSphere(leftGeo, 0.088, 0.0);
    const leftHemi = new THREE.Mesh(leftGeo, brainMat());
    leftHemi.position.set(-0.3, 0, 0);
    brain.add(leftHemi);

    // Right hemisphere (different seed → distinct gyri pattern)
    const rightGeo = new THREE.SphereGeometry(0.92, 80, 56);
    rightGeo.scale(0.96, 0.93, 0.97);
    displaceSphere(rightGeo, 0.088, 1.618); // golden ratio offset
    const rightHemi = new THREE.Mesh(rightGeo, brainMat());
    rightHemi.position.set(0.3, 0, 0);
    brain.add(rightHemi);

    // Longitudinal fissure — dark capsule between hemispheres
    const fissureGeo = new THREE.CapsuleGeometry(0.05, 1.1, 6, 16);
    const fissure = new THREE.Mesh(
      fissureGeo,
      new THREE.MeshStandardMaterial({ color: 0x06020f, roughness: 0.98 }),
    );
    fissure.rotation.z = Math.PI / 2;
    fissure.position.set(0, 0.52, 0.05);
    brain.add(fissure);

    // Cerebellum — back-bottom, own displacement seed
    const cerebGeo = new THREE.SphereGeometry(0.42, 52, 34);
    cerebGeo.scale(1.38, 0.62, 0.9);
    displaceSphere(cerebGeo, 0.052, 3.14);
    const cerebell = new THREE.Mesh(cerebGeo, brainMat());
    cerebell.position.set(0, -0.58, -0.72);
    brain.add(cerebell);

    // Brain stem
    const stemGeo = new THREE.CylinderGeometry(0.1, 0.07, 0.54, 12);
    const stem = new THREE.Mesh(
      stemGeo,
      new THREE.MeshStandardMaterial({
        color: 0x120820,
        emissive: 0x0a0515,
        emissiveIntensity: 0.4,
        roughness: 0.9,
      }),
    );
    stem.position.set(0, -0.96, -0.42);
    stem.rotation.x = 0.28;
    brain.add(stem);

    // ── Neural pathways ───────────────────────────────────────────────────────
    const tubeGroup = new THREE.Group();
    brain.add(tubeGroup);

    const pathways: Pathway[] = [];
    let t = 280; // first activation time (ms)

    // 9 paths on each hemisphere
    for (let side = -1; side <= 1; side += 2) {
      for (let i = 0; i < 9; i++) {
        const curve = makeSurfacePath(side * 0.3, 0.94);
        pathways.push(makeTubePathway(curve, tubeGroup, t));
        t += 72; // stagger activations
      }
    }

    // 4 paths that span the top connecting both hemispheres
    for (let i = 0; i < 4; i++) {
      // Straight top — make a curve that arcs over the crown
      const pts: THREE.Vector3[] = [];
      const startX = -0.4 + i * 0.2;
      for (let j = 0; j < 6; j++) {
        const u = j / 5;
        const x = startX + u * (0.4 - startX);
        const y = 0.88 + Math.sin(u * Math.PI) * 0.12;
        const z = (Math.random() - 0.5) * 0.4;
        pts.push(new THREE.Vector3(x, y, z));
      }
      const curve = new THREE.CatmullRomCurve3(pts);
      pathways.push(makeTubePathway(curve, tubeGroup, t));
      t += 60;
    }

    // ── Particle system (synaptic sparks) ─────────────────────────────────────
    const PARTICLE_COUNT = 380;
    const pPositions = new Float32Array(PARTICLE_COUNT * 3);
    const pColors = new Float32Array(PARTICLE_COUNT * 3);
    const pSizes = new Float32Array(PARTICLE_COUNT);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // Random point in a spherical shell around the brain
      const r = 1.4 + Math.random() * 1.1; // 1.4–2.5
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      pPositions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      pPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pPositions[i * 3 + 2] = r * Math.cos(phi);

      // Color: deep blue → cyan gradient
      const mix = Math.random();
      pColors[i * 3]     = 0.0 + mix * 0.18;   // R
      pColors[i * 3 + 1] = 0.42 + mix * 0.33;  // G
      pColors[i * 3 + 2] = 1.0;                 // B

      pSizes[i] = 0.018 + Math.random() * 0.028;
    }

    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute("position", new THREE.BufferAttribute(pPositions, 3));
    particleGeo.setAttribute("color",    new THREE.BufferAttribute(pColors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.030,
      sizeAttenuation: true,
      vertexColors: true,
      transparent: true,
      opacity: 0.0,            // fades in during animation
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // ── Render loop ───────────────────────────────────────────────────────────
    const startTime = performance.now();
    let rafId: number;

    const lerp = (a: number, b: number, t: number) => a + (b - a) * Math.min(1, t);

    const tick = () => {
      rafId = requestAnimationFrame(tick);
      const elapsed = performance.now() - startTime;

      // Brain — slow Y rotation, gentle x bob
      brain.rotation.y = elapsed * 0.00055;
      brain.rotation.x = Math.sin(elapsed * 0.00035) * 0.06;

      // Particles — counter-rotate for parallax depth
      particles.rotation.y = -elapsed * 0.00022;
      particles.rotation.x =  Math.sin(elapsed * 0.00028) * 0.04;

      // Fade particles in over first 800 ms
      particleMat.opacity = lerp(particleMat.opacity, 0.72, elapsed < 800 ? 0.006 : 0.0);

      // Synaptic sparkle — subtly pulse particle opacity
      particleMat.opacity += 0.04 * Math.sin(elapsed * 0.006) * (particleMat.opacity > 0.3 ? 1 : 0);

      // Neural pathway activation
      pathways.forEach((p) => {
        if (elapsed < p.activateAt) return;
        const progress = Math.min(1, (elapsed - p.activateAt) / 320);
        const pulse = 0.88 + 0.12 * Math.sin(elapsed * 0.0035 + p.activateAt * 0.001);

        p.core.opacity  = lerp(p.core.opacity,  progress * pulse,        0.075);
        p.mid.opacity   = lerp(p.mid.opacity,   0.42 * progress * pulse, 0.075);
        p.outer.opacity = lerp(p.outer.opacity, 0.14 * progress,         0.065);
      });

      renderer.render(scene, camera);
    };

    tick();

    const textTimer = window.setTimeout(() => setTextOpacity(1), 700);
    const fadeTimer = window.setTimeout(() => {
      setFadeOut(true);
      window.setTimeout(() => onDoneRef.current(), 700);
    }, 3000);

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(textTimer);
      clearTimeout(fadeTimer);
      renderer.dispose();
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh || obj instanceof THREE.Points) {
          obj.geometry.dispose();
          const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
          mats.forEach((m) => m.dispose());
        }
      });
    };
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "#06010f",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        opacity: fadeOut ? 0 : 1,
        transition: fadeOut ? "opacity 0.7s ease-out" : "none",
        pointerEvents: fadeOut ? "none" : "auto",
      }}
    >
      <canvas
        ref={canvasRef}
        width={320}
        height={320}
        style={{ display: "block" }}
      />

      <p
        style={{
          marginTop: 22,
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontSize: "0.8rem",
          fontWeight: 700,
          letterSpacing: "0.42em",
          textTransform: "uppercase",
          color: "#4499dd",
          opacity: textOpacity,
          transition: "opacity 1.2s ease-in",
        }}
      >
        STOPAMINE
      </p>
    </div>
  );
}
