"use client";

import { Canvas } from "@react-three/fiber";

export type ScrewSceneProps = {
  lengthMm: number;
  outerDiameterMm?: number;
  innerDiameterMm?: number;
  threadLengthMm?: number;
};

function SimpleScrew({
  lengthMm,
  outerDiameterMm,
  innerDiameterMm,
  threadLengthMm,
}: ScrewSceneProps) {
  const L = Math.max(lengthMm, 1);
  const od = Math.max(outerDiameterMm ?? 6, 0.1);
  const id = Math.max(innerDiameterMm ?? od * 0.55, 0.05);
  const tl = Math.min(threadLengthMm ?? L * 0.7, L);

  const inv = 1.75 / L;
  const headH = Math.min(L * 0.22, od * 1.5) * inv;
  const tipH = od * 0.35 * inv;
  const midH = L * inv - headH - tipH;
  const threadH = Math.min(tl * inv, Math.max(midH * 0.92, 0.08));
  const smoothH = Math.max(midH - threadH, 0);

  const headR = (od / 2) * inv;
  const shaftR = (id / 2) * inv;

  let y = 0;
  const headY = y + headH / 2;
  y += headH;
  const threadY = y + threadH / 2;
  y += threadH;
  const smoothY = y + smoothH / 2;
  y += smoothH;
  const tipY = y + tipH / 2;

  const total = headH + threadH + smoothH + tipH;
  const offset = -total / 2;

  const steel = "#b8a894";

  return (
    <group position={[0, offset, 0]} rotation={[0, 0.85, 0]}>
      <mesh position={[0, headY, 0]}>
        <cylinderGeometry args={[headR, headR * 0.92, headH, 28]} />
        <meshStandardMaterial color={steel} metalness={0.4} roughness={0.42} />
      </mesh>
      <mesh position={[0, threadY, 0]}>
        <cylinderGeometry args={[shaftR * 1.06, shaftR, threadH, 22]} />
        <meshStandardMaterial color="#a89882" metalness={0.35} roughness={0.5} />
      </mesh>
      {smoothH > 0.001 ? (
        <mesh position={[0, smoothY, 0]}>
          <cylinderGeometry args={[shaftR, shaftR, smoothH, 20]} />
          <meshStandardMaterial color={steel} metalness={0.38} roughness={0.44} />
        </mesh>
      ) : null}
      <mesh position={[0, tipY, 0]}>
        <cylinderGeometry args={[0, shaftR * 0.85, tipH, 16]} />
        <meshStandardMaterial color="#9d8f7c" metalness={0.32} roughness={0.48} />
      </mesh>
    </group>
  );
}

/**
 * Self-contained WebGL preview; mount only when visible (parent handles lifecycle).
 */
export default function ScrewScene(props: ScrewSceneProps) {
  return (
    <Canvas
      gl={{ antialias: true, alpha: true }}
      camera={{ position: [2.4, 0.35, 2.4], fov: 42, near: 0.05, far: 80 }}
      style={{ width: "100%", height: "100%", display: "block", background: "transparent" }}
      dpr={[1, 2]}
    >
      <color attach="background" args={["#1e1e1e"]} />
      <ambientLight intensity={0.55} />
      <directionalLight position={[3.5, 6, 4]} intensity={1.15} />
      <directionalLight position={[-2, -1, -3]} intensity={0.25} />
      <SimpleScrew {...props} />
    </Canvas>
  );
}
