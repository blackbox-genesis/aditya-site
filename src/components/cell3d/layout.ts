import * as THREE from "three";
import type { CameraStop } from "@/components/journey/steps";

// Seeded RNG so the cell is identical on every visit.
export function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

export const CELL_RADIUS = 6;

export const NUCLEUS = { center: v(-1.2, 0.6, 0.4), radius: 1.9 };
export const NUCLEOLUS = { center: NUCLEUS.center.clone().add(v(0.55, 0.45, 0.25)), radius: 0.5 };

export const GENE = {
  center: NUCLEUS.center.clone().add(v(-0.55, -0.7, 0.55)),
  axis: v(1, 0.35, -0.25).normalize(),
  length: 1.7,
  radius: 0.13,
};

export const CHLOROPLASTS = [
  { position: v(3.3, 2.3, 0.6), rotation: new THREE.Euler(0.3, 0.4, -0.5), scale: 1.15 },
  { position: v(-3.5, -2.5, 1.0), rotation: new THREE.Euler(-0.2, 0.8, 0.6), scale: 1 },
  { position: v(3.5, -1.0, -1.7), rotation: new THREE.Euler(0.9, -0.3, 1.3), scale: 0.95 },
  { position: v(-0.6, 3.7, -2.2), rotation: new THREE.Euler(0.1, 1.2, 0.2), scale: 0.9 },
  { position: v(-3.9, 1.2, -2.1), rotation: new THREE.Euler(1.1, 0.2, -0.3), scale: 0.85 },
];

export const MITOCHONDRIA = [
  { position: v(-2.6, 3.0, 1.4), rotation: new THREE.Euler(0.4, 0.2, 1.1) },
  { position: v(1.6, 1.0, 2.6), rotation: new THREE.Euler(1.2, 0.5, 0.2) },
  { position: v(-2.0, -1.4, 3.1), rotation: new THREE.Euler(0.2, 1.0, -0.6) },
  { position: v(2.4, -3.4, -1.6), rotation: new THREE.Euler(0.8, -0.4, 0.9) },
];

export const VACUOLE = { center: v(1.9, 0.6, -1.6), radius: 1.7 };

export const NETWORK = { center: v(1.3, -3.0, 1.4), radius: 1.35 };

// Membrane exit point for vesicles travelling to a neighbouring cell.
export const MEMBRANE_DIR = v(1, -0.55, 0.75).normalize();
export const MEMBRANE_POINT = MEMBRANE_DIR.clone().multiplyScalar(CELL_RADIUS);
export const NEIGHBOUR = { center: MEMBRANE_DIR.clone().multiplyScalar(CELL_RADIUS * 2 + 1.4), radius: CELL_RADIUS };

/** Camera stops: where the camera sits and what it looks at. */
export const CAMERA_STOPS: Record<CameraStop, { position: THREE.Vector3; target: THREE.Vector3 }> = {
  overview: { position: v(0, 0.6, 19), target: v(0, 0, 0) },
  hero: { position: v(3.5, 2.5, 16), target: v(0, 0, 0) },
  nucleus: { position: NUCLEUS.center.clone().add(v(2.2, 1.2, 5.4)), target: NUCLEUS.center },
  chloroplast: { position: CHLOROPLASTS[0].position.clone().add(v(0.9, 0.9, 3.2)), target: CHLOROPLASTS[0].position },
  pores: { position: NUCLEUS.center.clone().add(v(-2.8, 2.6, 3.4)), target: NUCLEUS.center.clone().add(v(-0.6, 0.9, 0.6)) },
  nucleolus: { position: NUCLEOLUS.center.clone().add(v(1.2, 0.6, 2.3)), target: NUCLEOLUS.center },
  about: { position: v(-6, 3.5, 9.5), target: NUCLEUS.center },
  landscape: { position: v(-4.5, 4.5, 17.5), target: v(0, 0, 0) },
  chromatinA: { position: NUCLEUS.center.clone().add(v(-0.4, -0.7, 3.2)), target: NUCLEUS.center.clone().add(v(-0.45, -0.45, 0.2)) },
  chromatinB: { position: NUCLEUS.center.clone().add(v(-2.6, 1.0, 1.7)), target: NUCLEUS.center.clone().add(v(0.1, -0.1, 0)) },
  chromatinC: { position: NUCLEUS.center.clone().add(v(2.4, -1.6, 1.6)), target: NUCLEUS.center.clone().add(v(-0.1, 0.1, 0)) },
  cytoplasm: { position: NETWORK.center.clone().add(v(1.6, 0.9, 4.0)), target: NETWORK.center },
  cytoplasmB: { position: NETWORK.center.clone().add(v(-2.8, 1.4, 3.0)), target: NETWORK.center.clone().add(v(0.2, -0.1, 0)) },
  gene: {
    position: GENE.center.clone().add(new THREE.Vector3().crossVectors(GENE.axis, v(0, 1, 0)).normalize().multiplyScalar(-1.7)).add(v(0, 0.3, 0.3)),
    target: GENE.center,
  },
  membrane: {
    position: MEMBRANE_POINT.clone().add(v(-1.5, -3.6, 3.4)),
    target: MEMBRANE_POINT.clone().add(MEMBRANE_DIR.clone().multiplyScalar(1.3)),
  },
  direction: { position: v(6, -3, 16), target: v(0, 0, 0) },
  closing: { position: v(0, 0.4, 23), target: v(0, 0, 0) },
};
