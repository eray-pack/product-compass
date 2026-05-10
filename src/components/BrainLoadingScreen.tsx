import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import brainUrl from "@/assets/brain_hologram.glb?url";

interface BrainLoadingScreenProps {
  onDone: () => void;
}

// ─── Neural pathway helpers (same as before) ─────────────────────────────────

interface Pathway {
  core: THREE.MeshBasicMaterial;
  mid: THREE.MeshBasicMaterial;
  outer: THREE.MeshBasicMaterial;
  activateAt: number;
}

function makeSurfacePath(
  center: THREE.Vector3,
  radius: number,
): THREE.CatmullRomCurve3 {
  const nPts = 5 + Math.floor(Math.random() * 5);
  const pts: THREE.Vector3[] = [];
  let phi = 0.5 + Math.random() * 2.1;
  let theta = -Math.PI * 0.55 + Math.random() * Math.PI * 1.1;
  const dphi = (Math.random() - 0.5) * 0.38;
  const dtheta = (Math.random() > 0.5 ? 1 : -1) * (0.22 + Math.random() * 0.48);
  for (let i = 0; i < nPts; i++) {
    phi = Math.max(0.3, Math.min(Math.PI * 0.85, phi + dphi));
    theta += dtheta;
    const dir = new THREE.Vector3(
      Math.sin(phi) * Math.cos(theta),
      Math.cos(phi),
      Math.sin(phi) * Math.sin(theta),
    );
    const offset = radius * 1.04 + Math.random() * 0.03;
    pts.push(center.clone().addScaledVector(dir, offset));
  }
  return new THREE.CatmullRomCurve3(pts);
}

function makeTubePathway(
  curve: THREE.CatmullRomCurve3,
  parent: THREE.Group,
  activateAt: number,
  scale: number,
): Pathway {
  const addTube = (r: number, mat: THREE.MeshBasicMaterial) => {
    parent.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 28, r, 5, false), mat));
  };

  const core = new THREE.MeshBasicMaterial({
    color: 0x00bfff, transparent: true, opacity: 0, depthWrite: false,
  });
  const mid = new THREE.MeshBasicMaterial({
    color: 0x00bfff, transparent: true, opacity: 0,
    blending: THREE.AdditiveBlending, depthWrite: false,
  });
  const outer = new THREE.MeshBasicMaterial({
    color: 0x0055cc, transparent: true, opacity: 0,
    blending: THREE.AdditiveBlending, depthWrite: false,
  });

  addTube(0.007 * scale, core);
  addTube(0.020 * scale, mid);
  addTube(0.044 * scale, outer);
  return { core, mid, outer, activateAt };
}

// ─── Component ────────────────────────────────────────────────────────────────

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

    // ── Lighting ──────────────────────────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0x100820, 3.0));

    const rimBlue = new THREE.PointLight(0x0044ff, 28, 16);
    rimBlue.position.set(-4.0, 0.8, -3.5);
    scene.add(rimBlue);

    const rimCyan = new THREE.PointLight(0x00aaff, 16, 14);
    rimCyan.position.set(4.0, -0.5, -3.0);
    scene.add(rimCyan);

    const topFill = new THREE.PointLight(0x5522cc, 4.5, 10);
    topFill.position.set(0, 3.0, 3.5);
    scene.add(topFill);

    // ── Brain root group (receives rotation) ──────────────────────────────────
    const brain = new THREE.Group();
    scene.add(brain);

    // ── Pathway + particle groups (populated after model loads) ───────────────
    const tubeGroup = new THREE.Group();
    brain.add(tubeGroup);

    // ── Particle system ───────────────────────────────────────────────────────
    const PARTICLE_COUNT = 380;
    const pPos = new Float32Array(PARTICLE_COUNT * 3);
    const pCol = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const r = 1.4 + Math.random() * 1.1;
      const t = Math.random() * Math.PI * 2;
      const p = Math.acos(2 * Math.random() - 1);
      pPos[i * 3]     = r * Math.sin(p) * Math.cos(t);
      pPos[i * 3 + 1] = r * Math.sin(p) * Math.sin(t);
      pPos[i * 3 + 2] = r * Math.cos(p);
      const mix = Math.random();
      pCol[i * 3]     = 0.0 + mix * 0.18;
      pCol[i * 3 + 1] = 0.42 + mix * 0.33;
      pCol[i * 3 + 2] = 1.0;
    }
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3));
    particleGeo.setAttribute("color",    new THREE.BufferAttribute(pCol, 3));
    const particleMat = new THREE.PointsMaterial({
      size: 0.030, sizeAttenuation: true, vertexColors: true,
      transparent: true, opacity: 0.0,
      blending: THREE.AdditiveBlending, depthWrite: false,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // ── Holographic brain material ─────────────────────────────────────────────
    const holoMat = new THREE.MeshStandardMaterial({
      color: 0x0a0a2a,
      emissive: new THREE.Color(0x001133),
      emissiveIntensity: 1.2,
      roughness: 0.55,
      metalness: 0.15,
      transparent: true,
      opacity: 0.92,
    });

    // Thin wireframe overlay for a hologram feel
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x003399,
      wireframe: true,
      transparent: true,
      opacity: 0.08,
      depthWrite: false,
    });

    // ── Load GLTF model ───────────────────────────────────────────────────────
    const pathways: Pathway[] = [];
    let modelLoaded = false;

    const loader = new GLTFLoader();
    loader.load(
      brainUrl,
      (gltf) => {
        const model = gltf.scene;

        // Fit model into a ~1.8-unit bounding sphere
        const box = new THREE.Box3().setFromObject(model);
        const size = new THREE.Vector3();
        const center = new THREE.Vector3();
        box.getSize(size);
        box.getCenter(center);

        const maxDim = Math.max(size.x, size.y, size.z);
        const targetSize = 1.8;
        const scaleFactor = targetSize / maxDim;
        model.scale.setScalar(scaleFactor);

        // Re-center after scaling
        model.position.sub(center.multiplyScalar(scaleFactor));

        // Apply holographic materials to every mesh in the model
        model.traverse((child) => {
          if (!(child instanceof THREE.Mesh)) return;
          child.material = holoMat;
          // Add wireframe overlay as a sibling mesh
          const wireOverlay = new THREE.Mesh(child.geometry, wireMat);
          wireOverlay.matrix.copy(child.matrix);
          wireOverlay.matrixAutoUpdate = false;
          child.add(wireOverlay);
        });

        brain.add(model);

        // ── Generate pathways scaled to the loaded model ──────────────────────
        // Re-compute bounding sphere after scaling
        const scaledBox = new THREE.Box3().setFromObject(model);
        const scaledSize = new THREE.Vector3();
        const scaledCenter = new THREE.Vector3();
        scaledBox.getSize(scaledSize);
        scaledBox.getCenter(scaledCenter);
        const modelRadius = Math.max(scaledSize.x, scaledSize.y, scaledSize.z) * 0.5;

        const leftCenter  = scaledCenter.clone().add(new THREE.Vector3(-modelRadius * 0.3, 0, 0));
        const rightCenter = scaledCenter.clone().add(new THREE.Vector3( modelRadius * 0.3, 0, 0));

        let t = 280;
        const pathScale = modelRadius / 0.94; // normalise to original procedural radius

        for (let i = 0; i < 9; i++) {
          pathways.push(makeTubePathway(makeSurfacePath(leftCenter,  modelRadius * 0.95), tubeGroup, t, pathScale));
          t += 72;
          pathways.push(makeTubePathway(makeSurfacePath(rightCenter, modelRadius * 0.95), tubeGroup, t, pathScale));
          t += 72;
        }
        // Crown arcs
        for (let i = 0; i < 4; i++) {
          const pts: THREE.Vector3[] = [];
          const startX = scaledCenter.x - modelRadius * 0.4 + i * modelRadius * 0.2;
          for (let j = 0; j < 6; j++) {
            const u = j / 5;
            pts.push(new THREE.Vector3(
              startX + u * modelRadius * 0.4,
              scaledCenter.y + modelRadius * 0.88 + Math.sin(u * Math.PI) * modelRadius * 0.12,
              scaledCenter.z + (Math.random() - 0.5) * modelRadius * 0.4,
            ));
          }
          pathways.push(makeTubePathway(new THREE.CatmullRomCurve3(pts), tubeGroup, t, pathScale));
          t += 60;
        }

        modelLoaded = true;
      },
      undefined,
      (err) => {
        // Model failed to load — scene stays with particles + lighting only
        console.warn("GLTFLoader error:", err);
        modelLoaded = true; // unblock animation
      },
    );

    // ── Render loop ───────────────────────────────────────────────────────────
    const startTime = performance.now();
    let rafId: number;
    const lerp = (a: number, b: number, t: number) => a + (b - a) * Math.min(1, t);

    const tick = () => {
      rafId = requestAnimationFrame(tick);
      const elapsed = performance.now() - startTime;

      // Slow Y rotation + gentle bob
      brain.rotation.y = elapsed * 0.00055;
      brain.rotation.x = Math.sin(elapsed * 0.00035) * 0.06;

      // Particles counter-rotate
      particles.rotation.y = -elapsed * 0.00022;
      particles.rotation.x =  Math.sin(elapsed * 0.00028) * 0.04;

      // Fade particles in
      if (elapsed < 800) {
        particleMat.opacity = lerp(particleMat.opacity, 0.72, 0.006);
      }
      particleMat.opacity += 0.04 * Math.sin(elapsed * 0.006) * (particleMat.opacity > 0.3 ? 1 : 0);

      // Neural pathway activation (only after model is ready)
      if (modelLoaded) {
        pathways.forEach((p) => {
          if (elapsed < p.activateAt) return;
          const progress = Math.min(1, (elapsed - p.activateAt) / 320);
          const pulse = 0.88 + 0.12 * Math.sin(elapsed * 0.0035 + p.activateAt * 0.001);
          p.core.opacity  = lerp(p.core.opacity,  progress * pulse,        0.075);
          p.mid.opacity   = lerp(p.mid.opacity,   0.42 * progress * pulse, 0.075);
          p.outer.opacity = lerp(p.outer.opacity, 0.14 * progress,         0.065);
        });
      }

      renderer.render(scene, camera);
    };

    tick();

    const textTimer = window.setTimeout(() => setTextOpacity(1), 700);
    const fadeTimer = window.setTimeout(() => {
      setFadeOut(true);
      window.setTimeout(() => onDoneRef.current(), 700);
    }, 3500); // slight extra time for model load

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(textTimer);
      clearTimeout(fadeTimer);
      renderer.dispose();
      holoMat.dispose();
      wireMat.dispose();
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
