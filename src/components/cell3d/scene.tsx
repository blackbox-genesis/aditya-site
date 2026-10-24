"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { DepthOfField, EffectComposer, N8AO, SMAA, ToneMapping, Vignette } from "@react-three/postprocessing";
import { ToneMappingMode, type DepthOfFieldEffect } from "postprocessing";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { journey } from "@/components/journey/store";
import { STEPS, type Step } from "@/components/journey/steps";
import { CellModel } from "./cell-model";
import { CAMERA_STOPS } from "./layout";

/** What the camera is looking at — depth of field keeps it sharp. */
const focusPoint = new THREE.Vector3();

/** Studio backdrop colours (match .scene-fallback in globals.css). */
const BACKDROP = { light: "#5a6c82", mid: "#2e3b4c", deep: "#1c2633", fog: "#2b3747" };

/** Where the subject sits on screen so it clears the text column. */
function framingFor(step: Step, portrait: boolean) {
  const shift = step.side === "center" ? 0 : step.side === "left" ? -1 : 1;
  return portrait ? new THREE.Vector2(0, shift === 0 ? 0 : 0.28) : new THREE.Vector2(shift * 0.2, 0);
}

/**
 * Scroll glides the camera along one continuous spline through every stop,
 * so it never slows to a halt between sections — no friction, just flow.
 */
function CameraRig() {
  const { camera, size } = useThree();
  const path = useMemo(() => {
    const stops = STEPS.map((s) => CAMERA_STOPS[s.camera]);
    return {
      position: new THREE.CatmullRomCurve3(stops.map((s) => s.position), false, "centripetal"),
      target: new THREE.CatmullRomCurve3(stops.map((s) => s.target), false, "centripetal"),
    };
  }, []);
  const pos = useRef(CAMERA_STOPS.overview.position.clone());
  const target = useRef(CAMERA_STOPS.overview.target.clone());
  const offset = useRef(new THREE.Vector2());
  const pointer = useRef(new THREE.Vector2());
  const tmp = useMemo(
    () => ({ p: new THREE.Vector3(), t: new THREE.Vector3(), sway: new THREE.Vector3(), frame: new THREE.Vector2() }),
    [],
  );

  useFrame((state, delta) => {
    const last = STEPS.length - 1;
    const p = Math.min(last, Math.max(0, journey.progress));
    path.position.getPoint(p / last, tmp.p);
    path.target.getPoint(p / last, tmp.t);

    // Gentle drift + pointer parallax, scaled to how close we are.
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dist = tmp.p.distanceTo(tmp.t);
    pointer.current.lerp(state.pointer, 1 - Math.exp(-delta * 2));
    const time = state.clock.elapsedTime;
    if (!reduce) {
      tmp.sway.set(
        Math.sin(time * 0.15) * 0.4 + pointer.current.x * 0.8,
        Math.cos(time * 0.12) * 0.3 + pointer.current.y * 0.5,
        0,
      );
      tmp.p.addScaledVector(tmp.sway, dist * 0.04);
    }

    const k = 1 - Math.exp(-delta * 6);
    pos.current.lerp(tmp.p, k);
    target.current.lerp(tmp.t, k);
    camera.position.copy(pos.current);
    camera.lookAt(target.current);
    focusPoint.copy(target.current);

    // Framing blends continuously between neighbouring steps too.
    const portrait = size.width < 768;
    const i = Math.min(last - 1, Math.floor(p));
    const f = p - i;
    tmp.frame.lerpVectors(framingFor(STEPS[i], portrait), framingFor(STEPS[i + 1], portrait), f * f * (3 - 2 * f));
    offset.current.lerp(tmp.frame, k);
    const cam = camera as THREE.PerspectiveCamera;
    cam.setViewOffset(
      size.width,
      size.height,
      offset.current.x * size.width,
      offset.current.y * size.height,
      size.width,
      size.height,
    );
  });

  return null;
}

/** Slate studio backdrop: a soft radial falloff, like a lit photo-studio sweep. */
function Backdrop() {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 1024;
    const ctx = canvas.getContext("2d")!;
    const g = ctx.createRadialGradient(630, 400, 0, 560, 480, 820);
    g.addColorStop(0, BACKDROP.light);
    g.addColorStop(0.55, BACKDROP.mid);
    g.addColorStop(1, BACKDROP.deep);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 1024, 1024);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);
  return <primitive attach="background" object={texture} />;
}

/** Soft studio reflections so membranes read as wet and glossy. */
function StudioEnvironment() {
  const gl = useThree((s) => s.gl);
  const env = useMemo(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const texture = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();
    return texture;
  }, [gl]);
  return <primitive attach="environment" object={env} />;
}

/** Shallow depth of field locked onto the camera's subject, like a microscope's focal plane. */
function MicroscopeFocus() {
  const ref = useRef<DepthOfFieldEffect>(null);
  useFrame(() => {
    ref.current?.target?.copy(focusPoint);
  });
  return <DepthOfField ref={ref} target={[0, 0, 0]} worldFocusRange={5} bokehScale={1.6} resolutionScale={0.5} />;
}

export default function CellScene() {
  // Sharp on high-density screens without supersampling, which can exhaust GPU memory.
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  return (
    <Canvas
      dpr={dpr}
      shadows={{ type: THREE.PCFShadowMap }}
      camera={{ fov: 40, near: 0.05, far: 200, position: [0, 0.6, 19] }}
      scene={{ environmentIntensity: 0.45 }}
      gl={{ antialias: false, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        gl.transmissionResolutionScale = 0.6; // refraction pass at reduced size keeps the GPU load sane
        gl.domElement.addEventListener("webglcontextlost", () => console.warn("WebGL context lost"));
      }}
    >
      <Backdrop />
      <fog attach="fog" args={[BACKDROP.fog, 24, 70]} />
      <StudioEnvironment />

      {/* Studio lighting: sky/ground ambience, one soft shadow-casting key, a cool fill and a gentle rim */}
      <hemisphereLight args={["#e9f0f6", "#3a4555", 1.0]} />
      <directionalLight
        position={[9, 12, 11]}
        intensity={2.4}
        color="#fff8f0"
        castShadow
        shadow-intensity={0.5}
        shadow-radius={6}
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.03}
        shadow-camera-left={-9}
        shadow-camera-right={9}
        shadow-camera-top={9}
        shadow-camera-bottom={-9}
        shadow-camera-near={1}
        shadow-camera-far={50}
      />
      <directionalLight position={[-9, -5, 6]} intensity={0.55} color="#c8d6e8" />
      <directionalLight position={[-4, 7, -11]} intensity={0.9} color="#e3ecff" />

      <CellModel />
      <CameraRig />
      <EffectComposer multisampling={0}>
        <N8AO halfRes quality="medium" aoRadius={0.6} distanceFalloff={0.7} intensity={2.2} color="#141b24" />
        <MicroscopeFocus />
        <ToneMapping mode={ToneMappingMode.NEUTRAL} />
        <SMAA />
        <Vignette eskil={false} offset={0.3} darkness={0.25} />
      </EffectComposer>
    </Canvas>
  );
}
