import * as THREE from "three";
import { mergeVertices } from "three/addons/utils/BufferGeometryUtils.js";

/** Direction the studio key light comes from (matches the shadow-casting light in scene.tsx). */
export const KEY_LIGHT_DIR = new THREE.Vector3(9, 12, 11).normalize();

/**
 * Solid organelle tissue: lit by the studio lights, casts and receives soft
 * shadows, with a slightly wet sheen. No self-illumination.
 */
export function createTissueMaterial(color: string, { roughness = 0.55, clearcoat = 0.2, sheen = 0.35 } = {}) {
  const c = new THREE.Color(color);
  return new THREE.MeshPhysicalMaterial({
    color: c,
    roughness,
    metalness: 0,
    clearcoat,
    clearcoatRoughness: 0.45,
    sheen,
    sheenColor: c.clone().lerp(new THREE.Color("#ffffff"), 0.4),
    sheenRoughness: 0.6,
  });
}

/**
 * Translucent organelle envelope: refracts and tints what is inside it,
 * like a gel-filled membrane under a microscope.
 */
export function createMembraneMaterial(color: string, { tint = color, thickness = 0.8, distance = 2.2, roughness = 0.12 } = {}) {
  return new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(color),
    transmission: 1,
    thickness,
    roughness,
    ior: 1.37,
    attenuationColor: new THREE.Color(tint),
    attenuationDistance: distance,
    clearcoat: 0.5,
    clearcoatRoughness: 0.35,
    specularIntensity: 0.8,
    envMapIntensity: 1,
  });
}

/**
 * Thin lipid film for the plasma membrane and cell wall: mostly clear where
 * you look straight through it, denser at grazing angles, shaded by the key
 * light so it reads as a lit 3D surface. Normal blending, no glow.
 */
export function createFilmMaterial(color: string, { face = 0.05, edge = 0.5 } = {}) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: new THREE.Color(color) },
      uFace: { value: face },
      uEdge: { value: edge },
      uLevel: { value: 1 },
      uLightDir: { value: KEY_LIGHT_DIR },
    },
    vertexShader: /* glsl */ `
      varying vec3 vNormal;
      varying vec3 vView;
      void main() {
        vec4 world = modelMatrix * vec4(position, 1.0);
        vNormal = normalize(mat3(modelMatrix) * normal);
        vView = normalize(cameraPosition - world.xyz);
        gl_Position = projectionMatrix * viewMatrix * world;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      uniform float uFace;
      uniform float uEdge;
      uniform float uLevel;
      uniform vec3 uLightDir;
      varying vec3 vNormal;
      varying vec3 vView;
      void main() {
        vec3 n = normalize(vNormal);
        if (!gl_FrontFacing) n = -n;
        float facing = abs(dot(n, vView));
        float rim = pow(1.0 - facing, 2.4);
        // Soft wrap lighting: lit side brighter, shadow side gently darker
        float light = 0.55 + 0.45 * clamp(dot(n, uLightDir) * 0.5 + 0.5, 0.0, 1.0);
        float alpha = mix(uFace, uEdge, rim) * uLevel;
        gl_FragColor = vec4(uColor * light, alpha);
      }
    `,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
}

/** Cheap pseudo-noise: a few rotated sine octaves, enough for organic wrinkles. */
function wrinkle(p: THREE.Vector3, seed: number, octaves: number) {
  let n = 0;
  let amp = 1;
  let freq = 1;
  let total = 0;
  for (let o = 0; o < octaves; o++) {
    n +=
      amp *
      (Math.sin(p.x * 3.1 * freq + seed + o * 1.7) * 0.5 +
        Math.sin(p.y * 4.3 * freq + seed * 2.1 + o * 2.3) * 0.3 +
        Math.sin(p.z * 5.7 * freq + seed * 0.7 + o * 0.9) * 0.2 +
        Math.sin((p.x + p.y - p.z) * 7.9 * freq + seed * 1.3) * 0.15);
    total += amp;
    amp *= 0.45;
    freq *= 2.3;
  }
  return n / total;
}

/** Displace a sphere into an organic, slightly lumpy and wrinkled shape. */
export function organicSphere(radius: number, detail: number, amount: number, seed = 1, octaves = 3) {
  const ico = new THREE.IcosahedronGeometry(radius, detail);
  ico.deleteAttribute("normal");
  ico.deleteAttribute("uv");
  const geo = mergeVertices(ico); // shared vertices → smooth normals
  const pos = geo.attributes.position;
  const p = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    p.fromBufferAttribute(pos, i).normalize();
    p.multiplyScalar(radius * (1 + amount * wrinkle(p, seed, octaves)));
    pos.setXYZ(i, p.x, p.y, p.z);
  }
  geo.computeVertexNormals();
  return geo;
}
