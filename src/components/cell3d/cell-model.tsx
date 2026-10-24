"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo } from "react";
import * as THREE from "three";
import { journey } from "@/components/journey/store";
import { STEPS, type Organelle } from "@/components/journey/steps";
import {
  CAMERA_STOPS,
  CELL_RADIUS,
  CHLOROPLASTS,
  GENE,
  MEMBRANE_DIR,
  MEMBRANE_POINT,
  MITOCHONDRIA,
  NEIGHBOUR,
  NETWORK,
  NUCLEOLUS,
  NUCLEUS,
  VACUOLE,
  rng,
} from "./layout";
import { createFilmMaterial, createMembraneMaterial, createTissueMaterial, organicSphere } from "./materials";

/** Natural, stain-like colours in the spirit of a biomedical illustration. */
const TISSUE = {
  membrane: "#d3e4dc",
  wall: "#dcd5b8",
  neighbour: "#ddd2e6",
  nucleusEnvelope: "#d6ccf2",
  nucleusTint: "#7a62b5",
  pore: "#8b7ac4",
  nucleolus: "#5d4590",
  chromatin: "#b5606f",
  dnaBackbone: "#a9bfdc",
  geneBackbone: "#d9a441",
  bases: ["#e0b04a", "#6aa07a", "#c96a5a", "#6c8fc9"],
  chloroEnvelope: "#a7d095",
  chloroTint: "#3f7a35",
  grana: "#3d7a39",
  lamella: "#74a868",
  mitoEnvelope: "#efb7a0",
  mitoTint: "#b9583f",
  cristae: "#c76a52",
  vacuole: "#e2f0f2",
  golgi: "#d4a45c",
  node: "#3f9c95",
  edge: "#9fcdc8",
  pulse: "#eef6f4",
  vesicleEnvelope: "#f2d4e3",
  vesicleTint: "#a95b88",
  granules: ["#5e4d6e", "#6d5b52", "#4f6070", "#66664c"],
};

const GOLGI_POSITION = new THREE.Vector3(-3.6, -1.2, -1.6); // back of the cell, clear of every camera stop

type Group = Organelle | "context";

/** A material whose brightness follows its organelle's focus level. */
type Tracked =
  | { kind: "surface"; mat: THREE.MeshPhysicalMaterial | THREE.MeshStandardMaterial; base: THREE.Color }
  | { kind: "film"; mat: THREE.ShaderMaterial };

const GROUPS: Group[] = ["nucleus", "chloroplast", "chromatin", "gene", "cytoplasm", "membrane", "context"];
/** Out-of-focus organelles step back gently; nothing ever glows. */
const RECEDE = 0.7;

/** Opaque parts cast and receive the key light's soft shadows. */
function solid<T extends THREE.Mesh>(mesh: T) {
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

/** Translucent envelopes only receive shadows; casting would darken their own contents. */
function envelope<T extends THREE.Mesh>(mesh: T) {
  mesh.receiveShadow = true;
  return mesh;
}

function buildCell() {
  const root = new THREE.Group();
  const tracked: Record<Group, Tracked[]> = {
    nucleus: [], chloroplast: [], chromatin: [], gene: [], cytoplasm: [], membrane: [], context: [],
  };
  const track = <M extends THREE.MeshPhysicalMaterial | THREE.MeshStandardMaterial>(g: Group, mat: M) => {
    tracked[g].push({ kind: "surface", mat, base: mat.color.clone() });
    return mat;
  };
  const tissue = (g: Group, color: string, opts?: Parameters<typeof createTissueMaterial>[1]) =>
    track(g, createTissueMaterial(color, opts));
  const membrane = (g: Group, color: string, opts?: Parameters<typeof createMembraneMaterial>[1]) =>
    track(g, createMembraneMaterial(color, opts));
  const film = (g: Group, color: string, opts?: Parameters<typeof createFilmMaterial>[1]) => {
    const mat = createFilmMaterial(color, opts);
    tracked[g].push({ kind: "film", mat });
    return mat;
  };
  const rand = rng(424242);
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();

  // ── Cell wall + plasma membrane: thin translucent films ─────
  root.add(new THREE.Mesh(organicSphere(CELL_RADIUS + 0.35, 28, 0.035, 2), film("context", TISSUE.wall, { face: 0.012, edge: 0.28 })));
  root.add(new THREE.Mesh(organicSphere(CELL_RADIUS, 28, 0.035, 2), film("context", TISSUE.membrane, { face: 0.025, edge: 0.45 })));

  // ── Nucleus: refracting envelope, pores, nucleolus ───────────
  const nucleus = new THREE.Group();
  nucleus.position.copy(NUCLEUS.center);
  nucleus.add(
    envelope(
      new THREE.Mesh(
        organicSphere(NUCLEUS.radius, 24, 0.03, 5, 4),
        membrane("nucleus", TISSUE.nucleusEnvelope, { tint: TISSUE.nucleusTint, thickness: 1.0, distance: 7 }),
      ),
    ),
  );
  const pores = solid(new THREE.InstancedMesh(new THREE.TorusGeometry(0.06, 0.018, 10, 22), tissue("nucleus", TISSUE.pore, { roughness: 0.6 }), 70));
  const zAxis = new THREE.Vector3(0, 0, 1);
  for (let i = 0; i < pores.count; i++) {
    // Fibonacci sphere for even pore spacing
    const y = 1 - (i / (pores.count - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const th = i * 2.399963;
    const n = new THREE.Vector3(Math.cos(th) * r, y, Math.sin(th) * r);
    q.setFromUnitVectors(zAxis, n);
    m.compose(n.clone().multiplyScalar(NUCLEUS.radius - 0.01), q, new THREE.Vector3(1, 1, 1));
    pores.setMatrixAt(i, m);
  }
  nucleus.add(pores);
  root.add(nucleus);

  const nucleolus = solid(
    new THREE.Mesh(organicSphere(NUCLEOLUS.radius, 8, 0.12, 13, 4), tissue("nucleus", TISSUE.nucleolus, { roughness: 0.8, sheen: 0.4 })),
  );
  nucleolus.position.copy(NUCLEOLUS.center);
  root.add(nucleolus);

  // ── Chromatin fibres ────────────────────────────────────────
  const chromatinMat = tissue("chromatin", TISSUE.chromatin, { roughness: 0.6, sheen: 0.5 });
  for (let f = 0; f < 11; f++) {
    const pts: THREE.Vector3[] = [];
    let p = new THREE.Vector3((rand() - 0.5) * 1.6, (rand() - 0.5) * 1.6, (rand() - 0.5) * 1.6);
    let dir = new THREE.Vector3(rand() - 0.5, rand() - 0.5, rand() - 0.5).normalize();
    for (let k = 0; k < 16; k++) {
      pts.push(NUCLEUS.center.clone().add(p));
      dir.add(new THREE.Vector3(rand() - 0.5, rand() - 0.5, rand() - 0.5).multiplyScalar(1.3)).normalize();
      let next = p.clone().addScaledVector(dir, 0.32);
      const toNucleolus = NUCLEUS.center.clone().add(next).distanceTo(NUCLEOLUS.center);
      if (next.length() > NUCLEUS.radius - 0.3 || toNucleolus < NUCLEOLUS.radius + 0.15) {
        dir = p.clone().negate().normalize();
        next = p.clone().addScaledVector(dir, 0.25);
      }
      p = next;
    }
    root.add(solid(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 140, 0.026, 8), chromatinMat)));
  }

  // ── Gene locus: DNA double helix, gene segment in gold ──────
  const backbone = tissue("gene", TISSUE.dnaBackbone, { roughness: 0.35, clearcoat: 0.6 });
  const geneSegment = tissue("gene", TISSUE.geneBackbone, { roughness: 0.3, clearcoat: 0.7 });
  const side = new THREE.Vector3().crossVectors(GENE.axis, new THREE.Vector3(0, 1, 0)).normalize();
  const up = new THREE.Vector3().crossVectors(side, GENE.axis).normalize();
  const helixPoint = (s: number, phase: number) => {
    const u = (s - 0.5) * GENE.length;
    const a = u * 9 + phase;
    return GENE.center.clone()
      .addScaledVector(GENE.axis, u)
      .addScaledVector(side, Math.cos(a) * GENE.radius)
      .addScaledVector(up, Math.sin(a) * GENE.radius);
  };
  const strand = (from: number, to: number, phase: number) =>
    new THREE.CatmullRomCurve3(Array.from({ length: 60 }, (_, i) => helixPoint(from + ((to - from) * i) / 59, phase)));
  for (const phase of [0, Math.PI]) {
    root.add(solid(new THREE.Mesh(new THREE.TubeGeometry(strand(0, 1, phase), 200, 0.018, 8), backbone)));
    root.add(solid(new THREE.Mesh(new THREE.TubeGeometry(strand(0.36, 0.64, phase), 80, 0.026, 10), geneSegment)));
  }
  const rungs = solid(
    new THREE.InstancedMesh(new THREE.CylinderGeometry(0.009, 0.009, 1, 6), tissue("gene", "#ffffff", { roughness: 0.45 }), 48),
  );
  const yAxis = new THREE.Vector3(0, 1, 0);
  for (let i = 0; i < rungs.count; i++) {
    const s = (i + 0.5) / rungs.count;
    const a = helixPoint(s, 0);
    const b = helixPoint(s, Math.PI);
    q.setFromUnitVectors(yAxis, b.clone().sub(a).normalize());
    m.compose(a.clone().add(b).multiplyScalar(0.5), q, new THREE.Vector3(1, a.distanceTo(b), 1));
    rungs.setMatrixAt(i, m);
    rungs.setColorAt(i, new THREE.Color(TISSUE.bases[i % TISSUE.bases.length]));
  }
  root.add(rungs);

  // ── Chloroplasts: envelope + grana stacks + lamellae ────────
  const granaMat = tissue("chloroplast", TISSUE.grana, { roughness: 0.55, sheen: 0.5 });
  const lamellaMat = tissue("chloroplast", TISSUE.lamella, { roughness: 0.5 });
  const chloroEnvelope = membrane("chloroplast", TISSUE.chloroEnvelope, { tint: TISSUE.chloroTint, thickness: 0.7, distance: 2.2, roughness: 0.1 });
  for (const cp of CHLOROPLASTS) {
    const g = new THREE.Group();
    g.position.copy(cp.position);
    g.rotation.copy(cp.rotation);
    g.scale.setScalar(cp.scale);
    const shell = envelope(new THREE.Mesh(organicSphere(1, 14, 0.025, 3, 4), chloroEnvelope));
    shell.scale.set(1.14, 0.52, 0.62);
    g.add(shell);
    const stacks = [-0.7, -0.35, 0, 0.35, 0.7];
    const grana = solid(new THREE.InstancedMesh(new THREE.CylinderGeometry(0.15, 0.15, 0.03, 20), granaMat, stacks.length * 6));
    stacks.forEach((x, si) => {
      for (let d = 0; d < 6; d++) {
        m.makeTranslation(x, -0.1 + d * 0.045 + (si % 2 ? 0.06 : -0.04), si % 2 ? 0.12 : -0.1);
        grana.setMatrixAt(si * 6 + d, m);
      }
    });
    g.add(grana);
    const lamella = new THREE.CatmullRomCurve3(stacks.map((x, si) => new THREE.Vector3(x, 0.02 + (si % 2 ? 0.06 : -0.04), si % 2 ? 0.12 : -0.1)));
    g.add(solid(new THREE.Mesh(new THREE.TubeGeometry(lamella, 60, 0.014, 6), lamellaMat)));
    root.add(g);
  }

  // ── Context organelles: mitochondria, vacuole, Golgi ────────
  const cristaeMat = tissue("context", TISSUE.cristae, { roughness: 0.55 });
  const mitoShell = membrane("context", TISSUE.mitoEnvelope, { tint: TISSUE.mitoTint, thickness: 0.35, distance: 1.2 });
  const crista = new THREE.CapsuleGeometry(0.018, 0.2, 4, 10);
  for (const mt of MITOCHONDRIA) {
    const g = new THREE.Group();
    g.position.copy(mt.position);
    g.rotation.copy(mt.rotation);
    g.add(envelope(new THREE.Mesh(new THREE.CapsuleGeometry(0.22, 0.6, 10, 24), mitoShell)));
    // Cristae: inner-membrane folds reaching in alternately from each side
    for (let k = 0; k < 8; k++) {
      const fold = solid(new THREE.Mesh(crista, cristaeMat));
      fold.position.set(k % 2 ? 0.05 : -0.05, -0.36 + k * 0.1, 0);
      fold.rotation.z = Math.PI / 2;
      fold.scale.set(1, 1, 2.6);
      g.add(fold);
    }
    root.add(g);
  }
  const vacuole = envelope(
    new THREE.Mesh(organicSphere(VACUOLE.radius, 20, 0.06, 9, 3), membrane("context", TISSUE.vacuole, { thickness: 0.2, distance: 14, roughness: 0.15 })),
  );
  vacuole.position.copy(VACUOLE.center);
  root.add(vacuole);

  // Golgi apparatus: a curved stack of flattened cisternae with budding vesicles
  const golgi = new THREE.Group();
  golgi.position.copy(GOLGI_POSITION);
  golgi.rotation.set(0.5, 0.9, 0.3);
  const golgiMat = tissue("context", TISSUE.golgi, { roughness: 0.5, sheen: 0.5 });
  for (let k = 0; k < 5; k++) {
    const cisterna = solid(new THREE.Mesh(new THREE.CapsuleGeometry(0.06, 0.78 - k * 0.09, 6, 16), golgiMat));
    cisterna.rotation.z = Math.PI / 2;
    cisterna.scale.set(1, 1, 3.2);
    cisterna.position.set((k - 2) ** 2 * 0.045, k * 0.15, 0);
    golgi.add(cisterna);
  }
  for (let k = 0; k < 6; k++) {
    const bud = solid(new THREE.Mesh(new THREE.IcosahedronGeometry(0.055, 2), golgiMat));
    bud.position.set((k % 2 ? 1 : -1) * (0.5 + rand() * 0.15), rand() * 0.6, (rand() - 0.5) * 0.3);
    golgi.add(bud);
  }
  root.add(golgi);

  // ── Metabolic network: ball-and-stick, like a molecular model ─
  const nodes: THREE.Vector3[] = [];
  for (let guard = 0; nodes.length < 20 && guard < 600; guard++) {
    const p = new THREE.Vector3(rand() - 0.5, rand() - 0.5, rand() - 0.5).multiplyScalar(2 * NETWORK.radius);
    if (p.length() > NETWORK.radius) continue;
    const w = p.add(NETWORK.center);
    if (nodes.every((n) => n.distanceTo(w) > 0.38)) nodes.push(w);
  }
  const edges: [number, number][] = [];
  nodes.forEach((a, i) => {
    nodes
      .map((b, j) => ({ j, d: a.distanceTo(b) }))
      .filter(({ j }) => j !== i)
      .sort((x, y) => x.d - y.d)
      .slice(0, 3)
      .forEach(({ j }) => {
        if (!edges.some(([x, y]) => (x === i && y === j) || (x === j && y === i))) edges.push([i, j]);
      });
  });
  const nodeMesh = solid(
    new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 3), tissue("cytoplasm", TISSUE.node, { roughness: 0.3, clearcoat: 0.8 }), nodes.length),
  );
  nodes.forEach((n, i) => {
    m.compose(n, new THREE.Quaternion(), new THREE.Vector3().setScalar(i % 4 === 0 ? 0.1 : 0.065));
    nodeMesh.setMatrixAt(i, m);
  });
  root.add(nodeMesh);
  const edgeMat = tissue("cytoplasm", TISSUE.edge, { roughness: 0.5 });
  for (const [a, b] of edges) {
    root.add(solid(new THREE.Mesh(new THREE.TubeGeometry(new THREE.LineCurve3(nodes[a], nodes[b]), 1, 0.013, 8), edgeMat)));
  }
  const pulseMat = tissue("cytoplasm", TISSUE.pulse, { roughness: 0.3, clearcoat: 0.8 });
  const pulses = Array.from({ length: 16 }, (_, i) => {
    const mesh = solid(new THREE.Mesh(new THREE.IcosahedronGeometry(0.035, 2), pulseMat));
    root.add(mesh);
    return { mesh, edge: edges[(i * 7) % edges.length], offset: rand(), speed: 0.25 + rand() * 0.35 };
  });

  // ── Membrane traffic: vesicles carrying DNA to a neighbouring cell ─
  const neighbour = new THREE.Mesh(organicSphere(NEIGHBOUR.radius, 24, 0.04, 11), film("membrane", TISSUE.neighbour, { face: 0.025, edge: 0.32 }));
  neighbour.position.copy(NEIGHBOUR.center);
  root.add(neighbour);
  const exitStart = MEMBRANE_POINT.clone().addScaledVector(MEMBRANE_DIR, -1.6);
  const exitEnd = NEIGHBOUR.center.clone().addScaledVector(MEMBRANE_DIR, -NEIGHBOUR.radius + 0.2);
  const wobbleAxis = new THREE.Vector3().crossVectors(MEMBRANE_DIR, new THREE.Vector3(0, 1, 0)).normalize();
  const vesicleShell = membrane("membrane", TISSUE.vesicleEnvelope, { tint: TISSUE.vesicleTint, thickness: 0.3, distance: 2 });
  const cargoMat = tissue("membrane", TISSUE.chromatin, { roughness: 0.5 });
  const cargoCurve = new THREE.CatmullRomCurve3(
    Array.from({ length: 10 }, (_, i) => new THREE.Vector3(-0.09 + i * 0.02, Math.sin(i * 1.4) * 0.04, Math.cos(i * 1.4) * 0.04)),
  );
  const vesicles = Array.from({ length: 8 }, (_, i) => {
    const g = new THREE.Group();
    const r = 0.16 + rand() * 0.08;
    g.add(envelope(new THREE.Mesh(new THREE.IcosahedronGeometry(r, 4), vesicleShell)));
    g.add(solid(new THREE.Mesh(new THREE.TubeGeometry(cargoCurve, 24, 0.014, 6), cargoMat)));
    root.add(g);
    return { g, offset: i / 8, lane: (rand() - 0.5) * 0.9, lift: (rand() - 0.5) * 0.9 };
  });

  // ── Cytoplasmic granules (ribosomes) ────────────────────────
  const palette = TISSUE.granules.map((c) => new THREE.Color(c));
  const count = 2200;
  const cameraSpots = Object.values(CAMERA_STOPS).map((s) => s.position);
  const positions = new Float32Array(count * 3);
  let made = 0;
  for (let i = 0; made < count && i < count * 20; i++) {
    const p = new THREE.Vector3(rand() - 0.5, rand() - 0.5, rand() - 0.5).multiplyScalar(2 * CELL_RADIUS);
    if (p.length() > CELL_RADIUS - 0.25 || p.distanceTo(NUCLEUS.center) < NUCLEUS.radius + 0.1) continue;
    // Keep granules off the camera's path so none smear across the lens.
    if (cameraSpots.some((c) => c.distanceTo(p) < 1.1)) continue;
    positions.set([p.x, p.y, p.z], made * 3);
    made++;
  }
  const granuleMat = track("context", new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.7 }));
  const granules = solid(new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.024, 1), granuleMat, made));
  for (let i = 0; i < made; i++) {
    m.makeTranslation(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]);
    granules.setMatrixAt(i, m);
    granules.setColorAt(i, palette[i % palette.length]);
  }
  root.add(granules);

  const levels = Object.fromEntries(GROUPS.map((g) => [g, 1])) as Record<Group, number>;

  /** Per-frame update: gentle focus, metabolic flux, vesicle traffic. */
  function animate(t: number, delta: number, focus: Organelle | "all") {
    const k = 1 - Math.exp(-delta * 3);
    for (const g of GROUPS) {
      const target = focus === "all" || g === focus ? 1 : g === "context" ? 0.85 : RECEDE;
      levels[g] += (target - levels[g]) * k;
      for (const tr of tracked[g]) {
        if (tr.kind === "surface") tr.mat.color.copy(tr.base).multiplyScalar(levels[g]);
        else tr.mat.uniforms.uLevel.value = 0.55 + 0.45 * levels[g];
      }
    }

    for (const p of pulses) {
      const s = (t * p.speed + p.offset) % 1;
      p.mesh.position.lerpVectors(nodes[p.edge[0]], nodes[p.edge[1]], s);
    }

    for (const v of vesicles) {
      const s = (t * 0.045 + v.offset) % 1;
      v.g.position
        .lerpVectors(exitStart, exitEnd, s)
        .addScaledVector(wobbleAxis, v.lane + Math.sin(t * 0.8 + v.offset * 9) * 0.08);
      v.g.position.y += v.lift + Math.sin(s * Math.PI) * 0.3;
      v.g.rotation.set(t * 0.4 + v.offset, t * 0.3, 0);
    }
  }

  return { root, animate };
}

export function CellModel() {
  const cell = useMemo(() => buildCell(), []);

  useFrame((state, delta) => {
    const step = STEPS[Math.min(STEPS.length - 1, Math.max(0, journey.active))];
    cell.animate(state.clock.elapsedTime, delta, journey.hovered ?? step.focus);
  });

  return <primitive object={cell.root} />;
}
