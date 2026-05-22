import { useEffect, useRef } from "react";
import * as THREE from "three";

// ─── Time of day ──────────────────────────────────────────────────────────────

type TimeOfDay = "day" | "evening" | "night";

function getTimeOfDay(): TimeOfDay {
  const h = new Date().getHours();
  if (h >= 6 && h < 20) return "day";
  if (h >= 20 && h < 22) return "evening";
  return "night";
}

type EnvConfig = {
  bgColor: number;
  fogColor: number;
  fogNear: number;
  fogFar: number;
  groundColor: number;
  ambientColor: number;
  ambientIntensity: number;
  sunColor: number;
  sunIntensity: number;
  sunPosition: [number, number, number];
  fillColor: number;
  fillIntensity: number;
  rimColor: number;
  rimIntensity: number;
  rimPosition: [number, number, number];
  stars: boolean;
};

const ENV: Record<TimeOfDay, EnvConfig> = {
  day: {
    bgColor:           0x87ceeb,  // light blue sky
    fogColor:          0xb0dff0,
    fogNear:           10,
    fogFar:            22,
    groundColor:       0x3a7d44,  // green grass
    ambientColor:      0xd4eaf7,
    ambientIntensity:  2.0,
    sunColor:          0xfff5cc,  // warm yellow sunlight
    sunIntensity:      2.2,
    sunPosition:       [4, 10, 5],
    fillColor:         0x88ccff,
    fillIntensity:     0.4,
    rimColor:          0xffeebb,
    rimIntensity:      0.6,
    rimPosition:       [-4, 3, -3],
    stars:             false,
  },
  evening: {
    bgColor:           0x1a0a2e,  // deep purple-blue base (gradient faked via fog)
    fogColor:          0x3d1a0a,  // orange-brown horizon
    fogNear:           6,
    fogFar:            16,
    groundColor:       0x2a1a10,  // dark earthy ground
    ambientColor:      0xff8844,  // orange ambient
    ambientIntensity:  1.2,
    sunColor:          0xff6622,  // deep orange sun on horizon
    sunIntensity:      1.6,
    sunPosition:       [-6, 1.5, 4],
    fillColor:         0x9933cc,  // purple fill from sky
    fillIntensity:     0.5,
    rimColor:          0xff4400,
    rimIntensity:      0.8,
    rimPosition:       [-5, 0.5, -2],
    stars:             false,
  },
  night: {
    bgColor:           0x020814,  // near-black deep blue
    fogColor:          0x030d20,
    fogNear:           7,
    fogFar:            18,
    groundColor:       0x0a1a14,  // very dark green-black
    ambientColor:      0x1a2a4a,  // cool blue-grey
    ambientIntensity:  1.0,
    sunColor:          0xc8d8ff,  // cool moonlight blue-white
    sunIntensity:      0.9,
    sunPosition:       [-3, 8, -5],
    fillColor:         0x0022aa,
    fillIntensity:     0.3,
    rimColor:          0x4466cc,
    rimIntensity:      0.4,
    rimPosition:       [4, 4, -4],
    stars:             true,
  },
};

// ─── Growth stage config ──────────────────────────────────────────────────────

type Stage = {
  trunkHeight: number;
  trunkRadius: number;
  branchLevels: number;
  branchCount: number;
  leafClusters: number;
  leafSize: number;
  leafOpacity: number;
};

function stageForDay(day: number): Stage {
  if (day < 7)  return { trunkHeight: 0.6, trunkRadius: 0.06, branchLevels: 0, branchCount: 0, leafClusters: 3,  leafSize: 0.12, leafOpacity: 0.8  };
  if (day < 14) return { trunkHeight: 1.1, trunkRadius: 0.09, branchLevels: 1, branchCount: 3, leafClusters: 6,  leafSize: 0.18, leafOpacity: 0.85 };
  if (day < 30) return { trunkHeight: 1.6, trunkRadius: 0.11, branchLevels: 2, branchCount: 4, leafClusters: 10, leafSize: 0.22, leafOpacity: 0.9  };
  if (day < 90) return { trunkHeight: 2.1, trunkRadius: 0.14, branchLevels: 3, branchCount: 5, leafClusters: 18, leafSize: 0.26, leafOpacity: 0.92 };
  return             { trunkHeight: 2.8, trunkRadius: 0.18, branchLevels: 4, branchCount: 6, leafClusters: 28, leafSize: 0.30, leafOpacity: 0.95 };
}

// ─── Tree builder ─────────────────────────────────────────────────────────────

function buildTree(scene: THREE.Scene, stage: Stage, env: EnvConfig) {
  const trunkMat = new THREE.MeshLambertMaterial({ color: 0x5c3a1e });
  const leafColor = env === ENV.night ? 0x1a4d2a : env === ENV.evening ? 0x2a5a20 : 0x2d7a3a;
  const leafMat = new THREE.MeshLambertMaterial({ color: leafColor, transparent: true, opacity: stage.leafOpacity });
  const glowMat = new THREE.MeshBasicMaterial({ color: 0x1a4d2e, transparent: true, opacity: 0.18, depthWrite: false });

  const group = new THREE.Group();

  // Trunk
  const trunkGeo = new THREE.CylinderGeometry(stage.trunkRadius * 0.6, stage.trunkRadius, stage.trunkHeight, 10);
  const trunk = new THREE.Mesh(trunkGeo, trunkMat);
  trunk.position.y = stage.trunkHeight / 2;
  trunk.castShadow = true;
  group.add(trunk);

  // Recursive branch builder
  function addBranches(
    parentPos: THREE.Vector3,
    parentDir: THREE.Vector3,
    length: number,
    radius: number,
    level: number,
    angleOffset: number
  ) {
    if (level > stage.branchLevels) return;
    for (let i = 0; i < stage.branchCount; i++) {
      const spreadAngle = (Math.PI * 2 * i) / stage.branchCount + angleOffset;
      const tiltAngle = 0.45 + Math.random() * 0.25;
      const dir = new THREE.Vector3(
        Math.sin(tiltAngle) * Math.cos(spreadAngle),
        Math.cos(tiltAngle),
        Math.sin(tiltAngle) * Math.sin(spreadAngle)
      ).normalize();
      const midPoint = parentPos.clone().add(dir.clone().multiplyScalar(length / 2));
      const branchGeo = new THREE.CylinderGeometry(radius * 0.5, radius, length, 7);
      const branch = new THREE.Mesh(branchGeo, trunkMat);
      const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
      branch.position.copy(midPoint);
      branch.quaternion.copy(quaternion);
      branch.castShadow = true;
      group.add(branch);
      const tipPos = parentPos.clone().add(dir.clone().multiplyScalar(length));
      if (level === stage.branchLevels || stage.branchLevels <= 1) {
        const clustersHere = Math.max(1, Math.floor(stage.leafClusters / Math.max(1, stage.branchCount * level)));
        for (let c = 0; c < clustersHere; c++) {
          const offset = new THREE.Vector3(
            (Math.random() - 0.5) * stage.leafSize * 1.5,
            (Math.random() - 0.5) * stage.leafSize,
            (Math.random() - 0.5) * stage.leafSize * 1.5
          );
          const leafPos = tipPos.clone().add(offset);
          const r = stage.leafSize * (0.7 + Math.random() * 0.6);
          const leaf = new THREE.Mesh(new THREE.SphereGeometry(r, 7, 5), leafMat);
          leaf.position.copy(leafPos);
          leaf.castShadow = true;
          group.add(leaf);
          const glow = new THREE.Mesh(new THREE.SphereGeometry(r * 1.5, 6, 4), glowMat);
          glow.position.copy(leafPos);
          group.add(glow);
        }
      }
      addBranches(tipPos, dir, length * 0.65, radius * 0.55, level + 1, angleOffset + 0.7);
    }
  }

  const trunkTip = new THREE.Vector3(0, stage.trunkHeight, 0);
  if (stage.branchLevels > 0) {
    addBranches(trunkTip, new THREE.Vector3(0, 1, 0), stage.trunkHeight * 0.42, stage.trunkRadius * 0.55, 1, 0);
  }

  // Top canopy cluster
  const topClusterCount = Math.min(5, stage.leafClusters);
  for (let i = 0; i < topClusterCount; i++) {
    const offset = new THREE.Vector3(
      (Math.random() - 0.5) * stage.leafSize * 1.2,
      Math.random() * stage.leafSize * 0.8,
      (Math.random() - 0.5) * stage.leafSize * 1.2
    );
    const pos = trunkTip.clone().add(offset);
    const r = stage.leafSize * (0.8 + Math.random() * 0.5);
    const leaf = new THREE.Mesh(new THREE.SphereGeometry(r, 7, 5), leafMat);
    leaf.position.copy(pos);
    group.add(leaf);
  }

  // Ground disc
  const ground = new THREE.Mesh(
    new THREE.CircleGeometry(1.2, 32),
    new THREE.MeshLambertMaterial({ color: env.groundColor })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = 0.01;
  group.add(ground);

  // Glow ring from below
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(0.6, 1.4, 32),
    new THREE.MeshBasicMaterial({ color: 0x3aff7a, transparent: true, opacity: 0.07, side: THREE.DoubleSide, depthWrite: false })
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.02;
  group.add(ring);

  scene.add(group);
  return group;
}

// ─── Stars builder ────────────────────────────────────────────────────────────

function addStars(scene: THREE.Scene) {
  const positions: number[] = [];
  for (let i = 0; i < 320; i++) {
    // Distribute on a hemisphere above the scene
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI * 0.5; // upper hemisphere only
    const r = 14 + Math.random() * 4;
    positions.push(
      r * Math.sin(phi) * Math.cos(theta),
      r * Math.cos(phi),
      r * Math.sin(phi) * Math.sin(theta)
    );
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  const mat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.08, sizeAttenuation: true, transparent: true, opacity: 0.85 });
  const stars = new THREE.Points(geo, mat);
  scene.add(stars);
  return stars;
}

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  day: number;
}

export function Tree3D({ day }: Props) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    const w = el.clientWidth;
    const h = el.clientHeight;
    const tod = getTimeOfDay();
    const env = ENV[tod];

    // Scene
    const scene = new THREE.Scene();
    scene.background = null;
    scene.fog = new THREE.Fog(env.fogColor, env.fogNear, env.fogFar);

    // Camera
    const camera = new THREE.PerspectiveCamera(42, w / h, 0.1, 50);
    camera.position.set(0, 2, 4);
    camera.lookAt(0, 0.5, 0);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setClearColor(0x000000, 0);
    renderer.setSize(w, h);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    const canvas = renderer.domElement;
    canvas.style.borderRadius = '50%';
    canvas.style.background = 'transparent';
    el.appendChild(canvas);

    // ── Lights ──
    const ambient = new THREE.AmbientLight(0xffffff, 4.0);
    scene.add(ambient);

    const sun = new THREE.DirectionalLight(0xffffff, 4.0);
    sun.position.set(2, 5, 3);
    scene.add(sun);

    // Stars (night only)
    if (env.stars) addStars(scene);

    // Tree
    const stage = stageForDay(day);
    const treeGroup = buildTree(scene, stage, env);

    // Animation loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      treeGroup.rotation.y += 0.003;
      renderer.render(scene, camera);
    };
    animate();

    // Resize handler
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
      if (el.contains(canvas)) el.removeChild(canvas);
    };
  }, [day]);

  return (
    <div style={{ borderRadius: '50%', boxShadow: '0 0 40px rgba(201,168,76,0.6), 0 0 80px rgba(201,168,76,0.3), 0 0 120px rgba(201,168,76,0.1)', border: '2px solid rgba(201,168,76,0.4)', width: '100%', height: '100%' }}>
      <div ref={mountRef} style={{ borderRadius: '50%', overflow: 'hidden', background: 'transparent', width: '100%', height: '100%' }} />
    </div>
  );
}
