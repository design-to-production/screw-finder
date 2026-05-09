"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Suspense, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import {
  buildScrewGroup,
  disposeScrewGroup,
  D2P_PREVIEW_BACKGROUND_HEX,
  SCREW_PREVIEW_SCENE,
  type ScrewPreviewParams,
} from "@/lib/screw-preview/screwPreviewImage";

/** Representative catalog proportions for the hero. */
const HERO_SCREW: ScrewPreviewParams = {
  lengthMm: 55,
  outerDiameterMm: 9.6,
  innerDiameterMm: 3.2,
  threadLengthMm: 32,
};

function HeroScrew() {
  const pivotRef = useRef<THREE.Group>(null);
  const screw = useMemo(() => buildScrewGroup(HERO_SCREW, "landingLight"), []);

  useEffect(() => () => disposeScrewGroup(screw), [screw]);

  useFrame((_, dt) => {
    const g = pivotRef.current;
    if (g) g.rotation.y += dt * 0.28;
  });

  return (
    <group ref={pivotRef}>
      <primitive object={screw} />
    </group>
  );
}

/** Brand-red screw on white scene (same as catalog PNG previews). */
export function LandingHeroCanvas() {
  return (
    <div
      className="relative h-[220px] w-full min-h-[180px] overflow-hidden rounded-2xl border border-d2p-border bg-white shadow-inner sm:h-[280px] lg:h-[min(360px,42vh)]"
      aria-hidden
    >
      <Canvas
        camera={{ fov: 42, near: 0.05, far: 80, position: [2.35, 0.35, 2.35] }}
        gl={{ antialias: true, alpha: false }}
        dpr={[1, 2]}
        onCreated={({ scene, gl }) => {
          scene.background = new THREE.Color(D2P_PREVIEW_BACKGROUND_HEX);
          const pmrem = new THREE.PMREMGenerator(gl);
          scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
          pmrem.dispose();
        }}
      >
        <ambientLight intensity={SCREW_PREVIEW_SCENE.ambient.intensity} color={SCREW_PREVIEW_SCENE.ambient.color} />
        {SCREW_PREVIEW_SCENE.directionals.map((d, i) => (
          <directionalLight key={i} position={[...d.position]} intensity={d.intensity} color={d.color} />
        ))}
        <Suspense fallback={null}>
          <HeroScrew />
        </Suspense>
      </Canvas>
      {/* Subtle brand warmth over scene edges */}
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-d2p-red/10"
        aria-hidden
      />
    </div>
  );
}
