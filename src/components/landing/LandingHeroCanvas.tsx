"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Suspense, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import {
  buildScrewGroup,
  disposeScrewGroup,
  D2P_PREVIEW_BACKGROUND_HEX,
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
        onCreated={({ scene }) => {
          scene.background = new THREE.Color(D2P_PREVIEW_BACKGROUND_HEX);
        }}
      >
        <ambientLight intensity={1.24} color="#ffffff" />
        <directionalLight position={[4.2, 7, 4.5]} intensity={2.1} color="#ffffff" />
        <directionalLight position={[-3.5, -2, -4]} intensity={0.76} color="#fff0ee" />
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
