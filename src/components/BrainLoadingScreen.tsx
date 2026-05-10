import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

interface BrainLoadingScreenProps {
  onDone: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Displacement — why each choice:
//
//  • SphereGeometry (not Icosahedron): its UV-grid topology means abs(sin)
//    waves land at consistent latitudes/longitudes → parallel ridges, not blobs.
//
//  • abs(sin) raised to power 0.45: values near 0 (sulci) get pushed down
//    further, values near 1 (gyri) stay high → narrow grooves, wide ridges.
//
//  • Primary freq 7–8: gives ≈5–6 visible gyri across a hemisphere when
//    viewed from the side — matches real brain scale.
//
//  • Two distinct seed offsets per hemisphere: left and right gyri patterns
//    differ, which is anatomically accurate.
//
//  • amp = 0.152: almost double the previous 0.088; ridges become prominent
//    enough to cast visible highlights/shadows under the rim lights.
// ─────────────────────────────────────────────────────────────────────────────
function displaceSphere(
  geo: THREE.SphereGeometry,
  amp: number,
  seed: number,
) {
  const pos = geo.attributes.position as THREE.BufferAttribute;

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
    const len = Math.sqrt(x * x + y * y + z * z) || 1;
    const nx = x / len, ny = y / len, nz = z / len;

    // ── Primary gyri ─────────────────────────────────────────────────────────
    // Oriented so ridges run roughly front-to-back (sagittal direction), which
    // is anatomically correct for the superior and lateral surfaces.
    // pow(abs(sin), 0.45) → peaks stay wide, troughs get pinched narrow.
    const g1 = Math.pow(Math.abs(Math.sin(nx * 7.4 + ny * 3.2 + seed)),        0.45);
    const g2 = Math.pow(Math.abs(Math.sin(ny * 7.8 - nz * 3.6 + seed * 1.4)), 0.45);
    const g3 = Math.pow(Math.abs(Math.sin(nz * 8.1 + nx * 2.9 + seed * 2.1)), 0.45);
    // Shift so mean ≈ 0 (pow(abs(sin), 0.45) has mean ~0.68, so subtract that)
    const primary = amp * 1.55 * ((g1 + g2 * 0.85 + g3 * 0.70) / 2.55 - 0.68);

    // ── Secondary folds ───────────────────────────────────────────────────────
    // Higher frequency, adds branching & T-junctions between major gyri.
    const s1 = Math.abs(Math.sin(nx * 13.2 + ny * 10.5 + seed * 0.9));
    const s2 = Math.abs(Math.sin(nz * 14.7 - ny * 11.3 + seed * 1.8));
    const secondary = amp * 0.48 * ((s1 + s2) * 0.5 - 0.5);

    // ── Fine surface texture ──────────────────────────────────────────────────
    const fine =
      amp * 0.18 * Math.sin(ny * 20.5 + nx * 16.8 + seed * 2.7) +
      amp * 0.11 * Math.cos(nz * 24.3 - nx * 19.1 + seed * 1.2);

    const r = len + primary + secondary + fine;
    pos.setXYZ(i, nx * r, ny * r, nz * r);
  }
  pos.needsUpdate = true;
  geo.computeVertexNormals();
}

// ─── Neural pathway helpers ───────────────────────────────────────────────────
interface Pathway {
  core:  THREE.MeshBasicMaterial;
  mid:   THREE.MeshBasicMaterial;
  outer: THREE.MeshBasicMaterial;
  activateAt: number;
}

function makeSurfacePath(cx: number, radius: number): THREE.CatmullRomCurve3 {
  const center = new THREE.Vector3(cx, 0, 0);
  const nPts   = 5 + Math.floor(Math.random() * 5);
  const pts: THREE.Vector3[] = [];
  let phi   = 0.5 + Math.random() * 2.1;
  let theta = -Math.PI * 0.55 + Math.random() * Math.PI * 1.1;
  const dphi   = (Math.random() - 0.5) * 0.36;
  const dtheta = (Math.random() > 0.5 ? 1 : -1) * (0.20 + Math.random() * 0.45);
  for (let i = 0; i < nPts; i++) {
    phi   = Math.max(0.3, Math.min(Math.PI * 0.85, phi + dphi));
    theta += dtheta;
    const dir = new THREE.Vector3(
      Math.sin(phi) * Math.cos(theta),
      Math.cos(phi),
      Math.sin(phi) * Math.sin(theta),
    );
    pts.push(center.clone().addScaledVector(dir, radius * 1.05 + Math.random() * 0.025));
  }
  return new THREE.CatmullRomCurve3(pts);
}

function makeTubePathway(
  curve: THREE.CatmullRomCurve3,
  parent: THREE.Group,
  activateAt: number,
): Pathway {
  const add = (r: number, mat: THREE.MeshBasicMaterial) =>
    parent.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 28, r, 5, false), mat));

  const core  = new THREE.MeshBasicMaterial({ color: 0x00cfff, transparent: true, opacity: 0, depthWrite: false });
  const mid   = new THREE.MeshBasicMaterial({ color: 0x00aaff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
  const outer = new THREE.MeshBasicMaterial({ color: 0x0044cc, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
  add(0.007, core);
  add(0.020, mid);
  add(0.044, outer);
  return { core, mid, outer, activateAt };
}

// ─── Component ────────────────────────────────────────────────────────────────
export function BrainLoadingScreen({ onDone }: BrainLoadingScreenProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [textOpacity, setTextOpacity] = useState(0);
  const [fadeOut,     setFadeOut]     = useState(false);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const W = 320, H = 320;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H);
    renderer.setClearColor(0x000000, 0);
    // Needed for per-material clipping planes (used on hemispheres)
    renderer.localClippingEnabled = true;

    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(44, W / H, 0.1, 100);
    camera.position.set(0, 0.2, 5.2);

    // ── Lighting ──────────────────────────────────────────────────────────────
    // Rim lights from behind + above rake across the gyri surface and
    // cast the sulci into shadow — this is what makes folds visible.
    scene.add(new THREE.AmbientLight(0x06101e, 6));

    // Hard blue rim — left-behind edge highlight
    const rimL = new THREE.PointLight(0x0033ff, 38, 20);
    rimL.position.set(-4.5, 1.0, -4.0);
    scene.add(rimL);

    // Cyan rim — right-behind for two-sided silhouette
    const rimR = new THREE.PointLight(0x0099ff, 22, 18);
    rimR.position.set(4.5, -0.6, -3.5);
    scene.add(rimR);

    // Front-top fill: illuminates gyri tops so they read against dark sulci
    const frontFill = new THREE.PointLight(0x1133aa, 8, 14);
    frontFill.position.set(0.5, 2.8, 4.5);
    scene.add(frontFill);

    // Subtle purple bottom bounce
    const bounce = new THREE.PointLight(0x220044, 3, 10);
    bounce.position.set(0, -3.0, 1.0);
    scene.add(bounce);

    // ── Hemisphere material factory ───────────────────────────────────────────
    const makeBrainMat = (clippingNormal: THREE.Vector3) => {
      const mat = new THREE.MeshStandardMaterial({
        color:             new THREE.Color(0xf2c4b0),  // light pink / flesh
        emissive:          new THREE.Color(0xc0524a),  // warm rose emissive glow
        emissiveIntensity: 0.18,                       // subtle — doesn't overpower the base colour
        roughness:         0.72,
        metalness:         0.02,
        transparent:       true,
        opacity:           0.97,
        side:              THREE.FrontSide,
        clippingPlanes: [new THREE.Plane(clippingNormal, 0.02)],
      });
      return mat;
    };

    // ── Brain root group ──────────────────────────────────────────────────────
    const brain = new THREE.Group();
    scene.add(brain);

    // ── LEFT hemisphere ───────────────────────────────────────────────────────
    // 96×64 segments → 6,145 unique vertices → plenty of resolution for
    // the 7–8 Hz displacement to land cleanly without aliasing.
    const lGeo = new THREE.SphereGeometry(0.92, 96, 64);
    lGeo.scale(0.96, 0.93, 0.98);
    displaceSphere(lGeo, 0.152, 0.0);
    const leftMat  = makeBrainMat(new THREE.Vector3(1, 0, 0));   // clip x > 0.02
    const leftHemi = new THREE.Mesh(lGeo, leftMat);
    leftHemi.position.set(-0.40, 0, 0);
    brain.add(leftHemi);

    // ── RIGHT hemisphere — different seed = different gyri pattern ────────────
    const rGeo = new THREE.SphereGeometry(0.92, 96, 64);
    rGeo.scale(0.96, 0.93, 0.98);
    displaceSphere(rGeo, 0.152, 1.618);                           // golden-ratio seed
    const rightMat  = makeBrainMat(new THREE.Vector3(-1, 0, 0)); // clip x < -0.02
    const rightHemi = new THREE.Mesh(rGeo, rightMat);
    rightHemi.position.set(0.40, 0, 0);
    brain.add(rightHemi);

    // ── Wireframe overlay ─────────────────────────────────────────────────────
    // Lower-res displaced spheres sitting 2% above the surface.
    // The coarser grid makes individual wireframe quads large enough to see.
    const wireMatL = new THREE.MeshBasicMaterial({ color: 0x003eaa, wireframe: true, transparent: true, opacity: 0.13, depthWrite: false, clippingPlanes: [new THREE.Plane(new THREE.Vector3(1, 0, 0), 0.02)] });
    const wireMatR = new THREE.MeshBasicMaterial({ color: 0x003eaa, wireframe: true, transparent: true, opacity: 0.13, depthWrite: false, clippingPlanes: [new THREE.Plane(new THREE.Vector3(-1, 0, 0), 0.02)] });

    const wlGeo = new THREE.SphereGeometry(0.96, 20, 14);
    wlGeo.scale(0.96, 0.93, 0.98);
    displaceSphere(wlGeo, 0.152, 0.0);
    const wl = new THREE.Mesh(wlGeo, wireMatL);
    wl.position.set(-0.40, 0, 0);
    brain.add(wl);

    const wrGeo = new THREE.SphereGeometry(0.96, 20, 14);
    wrGeo.scale(0.96, 0.93, 0.98);
    displaceSphere(wrGeo, 0.152, 1.618);
    const wr = new THREE.Mesh(wrGeo, wireMatR);
    wr.position.set(0.40, 0, 0);
    brain.add(wr);

    // ── Interhemispheric fissure ───────────────────────────────────────────────
    // A thin dark box that fills the visible gap between hemispheres —
    // the dark slot is what makes it look like two lobes, not one sphere.
    const fissureGeo = new THREE.BoxGeometry(0.10, 1.60, 1.20);
    const fissure = new THREE.Mesh(
      fissureGeo,
      new THREE.MeshStandardMaterial({ color: 0x020408, roughness: 1.0, metalness: 0 }),
    );
    fissure.position.set(0, 0.15, -0.05);
    brain.add(fissure);

    // Glowing fissure edge line — gives the slot a blue-lit look
    const fissureEdgeGeo = new THREE.BoxGeometry(0.012, 1.55, 1.15);
    const fissureEdge = new THREE.Mesh(
      fissureEdgeGeo,
      new THREE.MeshBasicMaterial({
        color: 0x0055cc, transparent: true, opacity: 0.55,
        blending: THREE.AdditiveBlending, depthWrite: false,
      }),
    );
    fissureEdge.position.set(0, 0.15, -0.05);
    brain.add(fissureEdge);

    // ── Cerebellum ────────────────────────────────────────────────────────────
    const cGeo = new THREE.SphereGeometry(0.44, 52, 36);
    cGeo.scale(1.35, 0.58, 0.86);
    displaceSphere(cGeo, 0.060, 3.14);
    const cerebMat = new THREE.MeshStandardMaterial({
      color:             new THREE.Color(0xeab8a4),  // slightly deeper pink for cerebellum
      emissive:          new THREE.Color(0xb04840),
      emissiveIntensity: 0.15,
      roughness:         0.75,
      metalness:         0.02,
      transparent:       true,
      opacity:           0.95,
    });
    const cerebell = new THREE.Mesh(cGeo, cerebMat);
    cerebell.position.set(0, -0.60, -0.75);
    brain.add(cerebell);

    // ── Brain stem ────────────────────────────────────────────────────────────
    const stemGeo = new THREE.CylinderGeometry(0.10, 0.07, 0.55, 12);
    const stem = new THREE.Mesh(
      stemGeo,
      new THREE.MeshStandardMaterial({
        color:             new THREE.Color(0xd4a090),  // muted pink-tan for stem
        emissive:          new THREE.Color(0x8b3030),
        emissiveIntensity: 0.12,
        roughness:         0.85,
        metalness:         0.01,
      }),
    );
    stem.position.set(0, -0.98, -0.46);
    stem.rotation.x = 0.28;
    brain.add(stem);

    // ── Neural pathway tubes ──────────────────────────────────────────────────
    const tubeGroup = new THREE.Group();
    brain.add(tubeGroup);

    const pathways: Pathway[] = [];
    let t = 260;
    for (let side = -1; side <= 1; side += 2) {
      for (let i = 0; i < 9; i++) {
        pathways.push(makeTubePathway(makeSurfacePath(side * 0.38, 0.98), tubeGroup, t));
        t += 70;
      }
    }
    for (let i = 0; i < 4; i++) {
      const pts: THREE.Vector3[] = [];
      const sx = -0.40 + i * 0.20;
      for (let j = 0; j < 6; j++) {
        const u = j / 5;
        pts.push(new THREE.Vector3(
          sx + u * (0.40 - sx),
          0.93 + Math.sin(u * Math.PI) * 0.14,
          (Math.random() - 0.5) * 0.44,
        ));
      }
      pathways.push(makeTubePathway(new THREE.CatmullRomCurve3(pts), tubeGroup, t));
      t += 58;
    }

    // ── Particle system ───────────────────────────────────────────────────────
    const N = 360;
    const pP = new Float32Array(N * 3), pC = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      const r  = 1.45 + Math.random() * 1.05;
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(2 * Math.random() - 1);
      pP[i*3]   = r * Math.sin(ph) * Math.cos(th);
      pP[i*3+1] = r * Math.sin(ph) * Math.sin(th);
      pP[i*3+2] = r * Math.cos(ph);
      const mx  = Math.random();
      pC[i*3]   = 0.02 + mx * 0.16;
      pC[i*3+1] = 0.40 + mx * 0.38;
      pC[i*3+2] = 1.0;
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute("position", new THREE.BufferAttribute(pP, 3));
    pGeo.setAttribute("color",    new THREE.BufferAttribute(pC, 3));
    const pMat = new THREE.PointsMaterial({
      size: 0.026, sizeAttenuation: true, vertexColors: true,
      transparent: true, opacity: 0,
      blending: THREE.AdditiveBlending, depthWrite: false,
    });
    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    // ── Render loop ───────────────────────────────────────────────────────────
    const start = performance.now();
    let rafId: number;
    const lerp = (a: number, b: number, t: number) => a + (b - a) * Math.min(1, t);

    const tick = () => {
      rafId = requestAnimationFrame(tick);
      const e = performance.now() - start;

      brain.rotation.y = e * 0.00048;
      brain.rotation.x = Math.sin(e * 0.00030) * 0.055;

      particles.rotation.y = -e * 0.00019;
      particles.rotation.x =  Math.sin(e * 0.00024) * 0.038;

      if (e < 900) pMat.opacity = lerp(pMat.opacity, 0.65, 0.005);
      pMat.opacity += 0.032 * Math.sin(e * 0.0055) * (pMat.opacity > 0.28 ? 1 : 0);

      // Subtle breathing pulse on the pink brain — stays in the 0.12–0.26 range
      // so the warm glow breathes without washing out the flesh colour.
      const pulse = 0.18 + 0.08 * Math.sin(e * 0.0016);
      leftMat.emissiveIntensity  = pulse;
      rightMat.emissiveIntensity = pulse;
      cerebMat.emissiveIntensity = pulse * 0.80;

      pathways.forEach((p) => {
        if (e < p.activateAt) return;
        const progress = Math.min(1, (e - p.activateAt) / 300);
        const pk = 0.88 + 0.12 * Math.sin(e * 0.0033 + p.activateAt * 0.001);
        p.core.opacity  = lerp(p.core.opacity,  progress * pk,        0.075);
        p.mid.opacity   = lerp(p.mid.opacity,   0.40 * progress * pk, 0.075);
        p.outer.opacity = lerp(p.outer.opacity, 0.13 * progress,      0.065);
      });

      renderer.render(scene, camera);
    };
    tick();

    const textTimer = window.setTimeout(() => setTextOpacity(1), 700);
    const fadeTimer = window.setTimeout(() => {
      setFadeOut(true);
      window.setTimeout(() => onDoneRef.current(), 700);
    }, 3300);

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
        background: "#04010e",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        opacity: fadeOut ? 0 : 1,
        transition: fadeOut ? "opacity 0.7s ease-out" : "none",
        pointerEvents: fadeOut ? "none" : "auto",
      }}
    >
      <canvas ref={canvasRef} width={320} height={320} style={{ display: "block" }} />
      <p
        style={{
          marginTop: 22,
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontSize: "0.8rem",
          fontWeight: 700,
          letterSpacing: "0.42em",
          textTransform: "uppercase",
          color: "#44aaee",
          opacity: textOpacity,
          transition: "opacity 1.2s ease-in",
        }}
      >
        STOPAMINE
      </p>
    </div>
  );
}
