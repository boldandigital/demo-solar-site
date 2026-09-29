"use client";

import { useRef, useMemo, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ScrollControls, useScroll, Environment } from "@react-three/drei";
import * as THREE from "three";

/**
 * SolarPanel — single panel unit: dark navy backplate + 6×10 grid of
 * green-tinted PV cells (BoxGeometry) on a subtle frame. Procedural, no
 * GLB asset to load.
 *
 * The panel reads scroll progress (drei's useScroll) and damps a target
 * rotation so it spins 360° as the user scrolls. No React re-renders —
 * useFrame mutates the THREE.Object3D directly.
 */
function SolarPanel() {
  const group = useRef<THREE.Group>(null);
  const scroll = useScroll();

  // 6×10 PV cells (60 cells, matches a real residential panel)
  const cells = useMemo(() => {
    const arr: Array<{ x: number; z: number }> = [];
    for (let row = 0; row < 6; row++) {
      for (let col = 0; col < 10; col++) {
        arr.push({ x: col - 4.5, z: row - 2.5 });
      }
    }
    return arr;
  }, []);

  useFrame((_, delta) => {
    if (!group.current) return;
    const offset = scroll.offset; // 0 → 1
    // Rotate 360° on Y over the entire scroll range
    const targetY = offset * Math.PI * 2;
    // Tilt slightly forward as user scrolls (toward the sun)
    const targetX = -0.25 - offset * 0.45;
    // Damp toward target — frame-rate-independent lerp
    group.current.rotation.y +=
      (targetY - group.current.rotation.y) * Math.min(delta * 6, 1);
    group.current.rotation.x +=
      (targetX - group.current.rotation.x) * Math.min(delta * 6, 1);
  });

  return (
    <group ref={group} rotation={[-0.25, 0, 0]} position={[0, 0, 0]}>
      {/* Frame — dark anodized aluminum */}
      <mesh position={[0, 0, -0.05]} castShadow receiveShadow>
        <boxGeometry args={[11.2, 6.7, 0.1]} />
        <meshStandardMaterial
          color="#1F2937"
          metalness={0.85}
          roughness={0.35}
        />
      </mesh>

      {/* Backing — deep navy anti-reflective coating */}
      <mesh position={[0, 0, -0.02]}>
        <boxGeometry args={[10.8, 6.3, 0.05]} />
        <meshStandardMaterial
          color="#0F172A"
          metalness={0.4}
          roughness={0.55}
        />
      </mesh>

      {/* PV cells — green-tinted solar panels with subtle glass sheen */}
      {cells.map((c, i) => (
        <mesh key={i} position={[c.x * 1.05, 0, c.z * 1.05]}>
          <boxGeometry args={[0.95, 0.04, 0.95]} />
          <meshPhysicalMaterial
            color="#1E40AF"
            metalness={0.4}
            roughness={0.15}
            clearcoat={0.9}
            clearcoatRoughness={0.1}
            iridescence={0.3}
            iridescenceIOR={1.4}
          />
        </mesh>
      ))}

      {/* Subtle sun-side highlight strip (lime accent) */}
      <mesh position={[0, 3.35, 0.01]}>
        <boxGeometry args={[10.8, 0.04, 0.04]} />
        <meshStandardMaterial
          color="#84CC16"
          emissive="#84CC16"
          emissiveIntensity={0.6}
        />
      </mesh>
    </group>
  );
}

/**
 * SolarScene — R3F Canvas wrapping SolarPanel with drei's ScrollControls
 * (pages=4, so 4 viewports of scroll drive the rotation).
 *
 * Pure visual layer; does NOT gate scroll. Page itself owns scroll height
 * via ScrollTrigger timelines.
 */
export function SolarScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 14], fov: 35 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      style={{ background: "transparent" }}
      shadows
    >
      <ambientLight intensity={0.35} />
      <directionalLight
        position={[5, 8, 6]}
        intensity={2.2}
        color="#FACC15"
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <directionalLight position={[-6, 4, 3]} intensity={0.7} color="#84CC16" />
      <Suspense fallback={null}>
        <ScrollControls pages={4} damping={0.15}>
          <SolarPanel />
        </ScrollControls>
        <Environment preset="sunset" />
      </Suspense>
    </Canvas>
  );
}
