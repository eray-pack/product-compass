import { useEffect, useRef } from "react";
import * as THREE from "three";

// ─── Stage configs (0 = Newborn … 7 = Legendary) ─────────────────────────────

type StageCfg = {
  scale: number;
  bodyColor: number;
  accentColor: number;
  eyeColor: number;
  rimColor: number;
  rimIntensity: number;
  auraColor: number | null;
  auraOpacity: number;
};

const STAGES: StageCfg[] = [
  // 0 – Newborn  (tiny light-grey pup)
  { scale: 0.40, bodyColor: 0xa8bac8, accentColor: 0xc8d8e4, eyeColor: 0x88bbff, rimColor: 0x4466aa, rimIntensity: 0.25, auraColor: null, auraOpacity: 0 },
  // 1 – Pup
  { scale: 0.52, bodyColor: 0x96aabb, accentColor: 0xb8ccd6, eyeColor: 0x77bbff, rimColor: 0x4466aa, rimIntensity: 0.28, auraColor: null, auraOpacity: 0 },
  // 2 – Young
  { scale: 0.64, bodyColor: 0x7d95a8, accentColor: 0xa4b8c4, eyeColor: 0x66aaff, rimColor: 0x3355aa, rimIntensity: 0.28, auraColor: null, auraOpacity: 0 },
  // 3 – Adolescent
  { scale: 0.78, bodyColor: 0x667888, accentColor: 0x8fa0ae, eyeColor: 0x55aaf0, rimColor: 0x3355aa, rimIntensity: 0.30, auraColor: null, auraOpacity: 0 },
  // 4 – Adult
  { scale: 0.93, bodyColor: 0x546070, accentColor: 0x788898, eyeColor: 0x44aae0, rimColor: 0x2244aa, rimIntensity: 0.30, auraColor: null, auraOpacity: 0 },
  // 5 – Strong  (eyes turn amber)
  { scale: 1.09, bodyColor: 0x424e5c, accentColor: 0x607080, eyeColor: 0xC4873A, rimColor: 0xC4873A, rimIntensity: 0.35, auraColor: null, auraOpacity: 0 },
  // 6 – Alpha  (dark fur, gold accents, gold aura)
  { scale: 1.28, bodyColor: 0x2c3040, accentColor: 0xC4873A, eyeColor: 0xE8A040, rimColor: 0xC4873A, rimIntensity: 0.55, auraColor: 0xC4873A, auraOpacity: 0.10 },
  // 7 – Legendary  (near-black, bright gold)
  { scale: 1.50, bodyColor: 0x181820, accentColor: 0xE8C060, eyeColor: 0xFFD060, rimColor: 0xFFAA20, rimIntensity: 0.70, auraColor: 0xFFAA20, auraOpacity: 0.14 },
];

// ─── Wolf mesh builder ────────────────────────────────────────────────────────

type AnimRefs = {
  wolfGroup: THREE.Group | null;
  breathGroup: THREE.Group | null;
  tailGroup: THREE.Group | null;
  frontLeftLeg: THREE.Group | null;
  frontRightLeg: THREE.Group | null;
  backLeftLeg: THREE.Group | null;
  backRightLeg: THREE.Group | null;
};

function buildWolf(scene: THREE.Scene, stageIdx: number, refs: AnimRefs): THREE.Group {
  const cfg = STAGES[Math.min(stageIdx, 7)];

  // Materials — flatShading gives low-poly faceted look
  const bodyMat  = new THREE.MeshLambertMaterial({ color: cfg.bodyColor,  flatShading: true });
  const accMat   = new THREE.MeshLambertMaterial({ color: cfg.accentColor, flatShading: true });
  const noseMat  = new THREE.MeshBasicMaterial({ color: 0x0e0604 });

  const wolfGroup = new THREE.Group();
  wolfGroup.scale.setScalar(cfg.scale);
  scene.add(wolfGroup);
  refs.wolfGroup = wolfGroup;

  // ── Breathe group (torso + haunches breathe together) ──────────────────────
  const breathGroup = new THREE.Group();
  wolfGroup.add(breathGroup);
  refs.breathGroup = breathGroup;

  // Main torso
  const body = new THREE.Mesh(new THREE.BoxGeometry(1.28, 0.56, 0.52), bodyMat);
  body.position.set(0, 0.82, 0);
  body.castShadow = true;
  breathGroup.add(body);

  // Chest block (front thicker)
  const chest = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.60, 0.52), bodyMat);
  chest.position.set(0.42, 0.80, 0);
  breathGroup.add(chest);

  // Haunch block (rear slightly taller)
  const haunch = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.62, 0.54), bodyMat);
  haunch.position.set(-0.42, 0.81, 0);
  breathGroup.add(haunch);

  // ── Neck ──────────────────────────────────────────────────────────────────
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.21, 0.33, 6), bodyMat);
  neck.position.set(0.58, 1.07, 0);
  neck.rotation.z = -0.55;
  neck.castShadow = true;
  wolfGroup.add(neck);

  // ── Head group (does NOT breathe — stays stable) ───────────────────────────
  const headGroup = new THREE.Group();
  headGroup.position.set(0.80, 1.28, 0);
  wolfGroup.add(headGroup);

  // Skull
  const skull = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.40, 0.36), bodyMat);
  skull.castShadow = true;
  headGroup.add(skull);

  // Cheek wedges (low-poly face shape)
  for (const side of [1, -1]) {
    const cheek = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.30, 0.14), bodyMat);
    cheek.position.set(0, -0.04, side * 0.22);
    headGroup.add(cheek);
  }

  // Snout
  const snout = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.19, 0.24), accMat);
  snout.position.set(0.30, -0.07, 0);
  headGroup.add(snout);

  // Nose tip
  const nose = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.055, 0.08), noseMat);
  nose.position.set(0.45, -0.03, 0);
  headGroup.add(nose);

  // Eyes
  for (const side of [1, -1]) {
    const EX = 0.20, EY = 0.07, EZ = side * 0.14;

    // Iris — shiny Phong sphere
    const eye = new THREE.Mesh(
      new THREE.SphereGeometry(0.055, 16, 16),
      new THREE.MeshPhongMaterial({ color: cfg.eyeColor, shininess: 120, specular: 0xffffff })
    );
    eye.position.set(EX, EY, EZ);
    headGroup.add(eye);

    // Pupil — dark sphere sitting 0.02 in front
    const pupil = new THREE.Mesh(
      new THREE.SphereGeometry(0.028, 12, 12),
      new THREE.MeshBasicMaterial({ color: 0x111111 })
    );
    pupil.position.set(EX + 0.02, EY, EZ);
    headGroup.add(pupil);

    // Highlight — tiny white sphere top-right, 0.025 in front
    const highlight = new THREE.Mesh(
      new THREE.SphereGeometry(0.012, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0xffffff })
    );
    highlight.position.set(EX + 0.025, EY + 0.022, EZ + side * 0.018);
    headGroup.add(highlight);

    // Glow — larger transparent sphere behind the iris
    const glow = new THREE.Mesh(
      new THREE.SphereGeometry(0.072, 12, 12),
      new THREE.MeshBasicMaterial({ color: cfg.eyeColor, transparent: true, opacity: 0.30 })
    );
    glow.position.set(EX - 0.01, EY, EZ);
    headGroup.add(glow);
  }

  // Ears
  for (const side of [1, -1]) {
    const ear = new THREE.Mesh(new THREE.ConeGeometry(0.085, 0.21, 3), bodyMat);
    ear.position.set(0.02, 0.29, side * 0.12);
    ear.rotation.z = side * 0.16;
    ear.castShadow = true;
    headGroup.add(ear);
    // Inner ear accent
    const innerEar = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.12, 3), accMat);
    innerEar.position.set(0.02, 0.29, side * 0.12);
    innerEar.rotation.z = side * 0.16;
    headGroup.add(innerEar);
  }

  // ── Legs (4×) — grouped for walk animation ────────────────────────────────
  const makeLeg = (x: number, z: number): THREE.Group => {
    const group = new THREE.Group();
    group.position.set(x, 0.76, z);           // pivot at top of thigh
    const upper = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.075, 0.28, 6), bodyMat);
    upper.position.set(0, -0.14, 0);          // center of 0.28 cylinder below pivot
    upper.castShadow = true;
    group.add(upper);
    const lower = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.058, 0.28, 6), bodyMat);
    lower.position.set(0, -0.44, 0);
    lower.castShadow = true;
    group.add(lower);
    const paw = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.06, 0.12), accMat);
    paw.position.set(0, -0.70, 0);
    group.add(paw);
    return group;
  };

  const frontLeftLeg  = makeLeg( 0.36,  0.21);
  const frontRightLeg = makeLeg( 0.36, -0.21);
  const backLeftLeg   = makeLeg(-0.36,  0.21);
  const backRightLeg  = makeLeg(-0.36, -0.21);
  wolfGroup.add(frontLeftLeg, frontRightLeg, backLeftLeg, backRightLeg);
  refs.frontLeftLeg  = frontLeftLeg;
  refs.frontRightLeg = frontRightLeg;
  refs.backLeftLeg   = backLeftLeg;
  refs.backRightLeg  = backRightLeg;

  // ── Tail (3 tapered segments, curled up) ───────────────────────────────────
  const tailGroup = new THREE.Group();
  tailGroup.position.set(-0.70, 0.80, 0);
  wolfGroup.add(tailGroup);
  refs.tailGroup = tailGroup;

  const tail1 = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.095, 0.30, 5), accMat);
  tail1.rotation.z = 0.90;
  tail1.position.set(-0.13, 0.12, 0);
  tailGroup.add(tail1);

  const tail2 = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.055, 0.24, 5), bodyMat);
  tail2.rotation.z = 1.30;
  tail2.position.set(-0.24, 0.28, 0);
  tailGroup.add(tail2);

  const tail3 = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.038, 0.17, 4), accMat);
  tail3.rotation.z = 1.55;
  tail3.position.set(-0.31, 0.42, 0);
  tailGroup.add(tail3);

  // ── Ground disc ───────────────────────────────────────────────────────────
  const ground = new THREE.Mesh(
    new THREE.CircleGeometry(1.40, 20),
    new THREE.MeshLambertMaterial({ color: 0x152218, flatShading: true })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = 0.004;
  wolfGroup.add(ground);

  // Grass edge ring (darker)
  const rim = new THREE.Mesh(
    new THREE.RingGeometry(1.20, 1.50, 20),
    new THREE.MeshLambertMaterial({ color: 0x0e1a12, side: THREE.DoubleSide })
  );
  rim.rotation.x = -Math.PI / 2;
  rim.position.y = 0.003;
  wolfGroup.add(rim);

  // ── Aura ring (alpha / legendary only) ───────────────────────────────────
  if (cfg.auraColor !== null) {
    const aura = new THREE.Mesh(
      new THREE.RingGeometry(0.55, 1.30, 28),
      new THREE.MeshBasicMaterial({
        color: cfg.auraColor,
        transparent: true,
        opacity: cfg.auraOpacity,
        side: THREE.DoubleSide,
        depthWrite: false,
      })
    );
    aura.rotation.x = -Math.PI / 2;
    aura.position.y = 0.01;
    wolfGroup.add(aura);
  }

  return wolfGroup;
}

// ─── Stars ────────────────────────────────────────────────────────────────────

function addStars(scene: THREE.Scene) {
  const pos: number[] = [];
  for (let i = 0; i < 300; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi   = Math.random() * Math.PI * 0.48;
    const r     = 14 + Math.random() * 4;
    pos.push(
      r * Math.sin(phi) * Math.cos(theta),
      r * Math.cos(phi),
      r * Math.sin(phi) * Math.sin(theta),
    );
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.075, sizeAttenuation: true, transparent: true, opacity: 0.82 });
  scene.add(new THREE.Points(geo, mat));
}

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  /** 0–7 matching wolfXPStage().stage */
  stage: number;
}

export function Wolf3D({ stage }: Props) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    const w = el.clientWidth;
    const h = el.clientHeight;

    // ── Scene ──────────────────────────────────────────────────────────────
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020508);
    scene.fog = new THREE.Fog(0x020810, 7, 18);

    // ── Camera ─────────────────────────────────────────────────────────────
    const camera = new THREE.PerspectiveCamera(42, w / h, 0.1, 50);
    camera.position.set(0, 1.8, 5.0);
    camera.lookAt(0, 0.8, 0);

    // ── Renderer ───────────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    el.appendChild(renderer.domElement);

    // ── Lights ─────────────────────────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0xffffff, 1.8));

    const mainLight = new THREE.DirectionalLight(0xffffff, 2.5);
    mainLight.position.set(5, 8, 5);
    scene.add(mainLight);

    const fillLight = new THREE.DirectionalLight(0xfff5e0, 1.2);
    fillLight.position.set(-5, 3, -3);
    scene.add(fillLight);

    const goldRim = new THREE.DirectionalLight(0xC9A84C, 0.8);
    goldRim.position.set(0, -2, -5);
    scene.add(goldRim);

    // Stars
    addStars(scene);

    // ── Wolf ───────────────────────────────────────────────────────────────
    const refs: AnimRefs = { wolfGroup: null, breathGroup: null, tailGroup: null, frontLeftLeg: null, frontRightLeg: null, backLeftLeg: null, backRightLeg: null };
    const wolfGroup = buildWolf(scene, stage, refs);

    // Auto-fit camera to wolf size
    const box    = new THREE.Box3().setFromObject(wolfGroup);
    const size   = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    wolfGroup.position.x -= center.x;
    wolfGroup.position.z -= center.z;
    camera.position.y = size.y * 0.65 + 0.8;
    camera.position.z = size.y * 2.1 + 2.4;
    camera.lookAt(0, size.y * 0.40, 0);

    // ── Animation ──────────────────────────────────────────────────────────
    const clock = new THREE.Clock();
    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      // Slow Y rotation (show wolf from all sides)
      wolfGroup.rotation.y = t * 0.38;

      // Breathing — subtle torso scale
      if (refs.breathGroup) {
        const b = 1 + Math.sin(t * 1.85) * 0.021;
        refs.breathGroup.scale.y = b;
        refs.breathGroup.position.y = Math.sin(t * 1.85) * 0.009;
      }

      // Tail wag
      if (refs.tailGroup) {
        refs.tailGroup.rotation.y = Math.sin(t * 3.0) * 0.52;
      }

      // Walking cycle
      const walkSpeed = 2.5;
      const walkAmp   = 0.4;
      if (refs.frontLeftLeg)  refs.frontLeftLeg.rotation.z  = Math.sin(t * walkSpeed) * walkAmp;
      if (refs.frontRightLeg) refs.frontRightLeg.rotation.z = Math.sin(t * walkSpeed + Math.PI) * walkAmp;
      if (refs.backLeftLeg)   refs.backLeftLeg.rotation.z   = Math.sin(t * walkSpeed + Math.PI) * walkAmp;
      if (refs.backRightLeg)  refs.backRightLeg.rotation.z  = Math.sin(t * walkSpeed) * walkAmp;

      // Body bob
      wolfGroup.position.y = Math.abs(Math.sin(t * walkSpeed)) * 0.05;

      renderer.render(scene, camera);
    };
    animate();

    // ── Resize ─────────────────────────────────────────────────────────────
    const onResize = () => {
      const nw = el.clientWidth;
      const nh = el.clientHeight;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(el);

    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
      renderer.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
  }, [stage]);

  return <div ref={mountRef} className="w-full h-full" />;
}
