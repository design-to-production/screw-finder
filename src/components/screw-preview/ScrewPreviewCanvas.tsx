"use client";

import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect, useMemo } from "react";
import * as THREE from "three";
import {
  buildScrewGroup,
  disposeScrewGroup,
  D2P_PREVIEW_BACKGROUND_HEX,
  screwPreviewCacheKey,
  SCREW_PREVIEW_SCENE,
  type ScrewPreviewParams,
} from "@/lib/screw-preview/screwPreviewImage";

function ScrewMesh({ params }: { params: ScrewPreviewParams }) {
  const key = screwPreviewCacheKey(params);
  const screw = useMemo(() => buildScrewGroup(params, "landingLight"), [key]);

  useEffect(() => () => disposeScrewGroup(screw), [screw]);

  return <primitive object={screw} />;
}

export type ScrewPreviewCanvasProps = ScrewPreviewParams & {
  className?: string;
  /** When true (default), drag to orbit, scroll to zoom — no idle spin. */
  orbitControls?: boolean;
};

/** Live R3F preview — same lighting/materials as landing hero & PNG pipeline (`landingLight`). */
export function ScrewPreviewCanvas({
  className = "",
  orbitControls = true,
  lengthMm,
  outerDiameterMm,
  innerDiameterMm,
  threadLengthMm,
}: ScrewPreviewCanvasProps) {
  const params: ScrewPreviewParams = {
    lengthMm,
    outerDiameterMm,
    innerDiameterMm,
    threadLengthMm,
  };

  return (
    <div
      className={`relative overflow-hidden rounded-lg border border-d2p-border bg-white shadow-inner ${className}`}
      aria-label="3D screw preview — drag to rotate, scroll to zoom"
    >
      <div className="absolute inset-0">
        <Canvas
          camera={{ fov: 42, near: 0.05, far: 80, position: [2.35, 0.35, 2.35] }}
          gl={{ antialias: true, alpha: false }}
          dpr={[1, 2]}
          style={{ width: "100%", height: "100%" }}
          onCreated={({ scene }) => {
            scene.background = new THREE.Color(D2P_PREVIEW_BACKGROUND_HEX);
          }}
        >
          <ambientLight intensity={SCREW_PREVIEW_SCENE.ambient.intensity} color={SCREW_PREVIEW_SCENE.ambient.color} />
          {SCREW_PREVIEW_SCENE.directionals.map((d, i) => (
            <directionalLight key={i} position={[...d.position]} intensity={d.intensity} color={d.color} />
          ))}
          <Suspense fallback={null}>
            <ScrewMesh params={params} />
            {orbitControls ? (
              <OrbitControls
                makeDefault
                enablePan
                enableZoom
                minDistance={1.4}
                maxDistance={14}
                target={[0, 0, 0]}
                enableDamping
                dampingFactor={0.08}
              />
            ) : null}
          </Suspense>
        </Canvas>
      </div>
      <div
        className="pointer-events-none absolute inset-0 rounded-[inherit] ring-1 ring-inset ring-d2p-red/10"
        aria-hidden
      />
    </div>
  );
}
