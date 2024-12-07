'use client';
import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

interface GltfViewerProps {
  size?: { width: string; height: string }; // Canvas 크기
}

const Star: React.FC<{ orbitRadius: number; speed: number }> = ({ orbitRadius, speed }) => {
  const gltf = useGLTF('/models/star.glb');
  const ref = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (ref.current) {
      const time = clock.getElapsedTime();
      const x = orbitRadius * Math.cos(time * speed);
      const z = orbitRadius * Math.sin(time * speed);
      ref.current.position.set(x, 0, z);

      ref.current.rotation.y = time * 1; // 느린 회전
      const scale = 0.5 + Math.abs(Math.sin(time * 2)) * 0.05; // 크기 변화 범위 0.5 ~ 0.55
      ref.current.scale.set(scale, scale, scale);
    }
  });

  return <primitive ref={ref} object={gltf.scene} />;
};

const Star2: React.FC<{ orbitRadius: number; speed: number }> = ({ orbitRadius, speed }) => {
  const gltf = useGLTF('/models/star2.glb');
  const ref = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (ref.current) {
      const time = clock.getElapsedTime();
      const x = orbitRadius * Math.cos(time * speed + Math.PI / 3);
      const z = orbitRadius * Math.sin(time * speed + Math.PI / 3);
      ref.current.position.set(x, 0, z);

      ref.current.rotation.y = time * 1;
      const scale = 0.5 + Math.abs(Math.sin(time * 2)) * 0.05;
      ref.current.scale.set(scale, scale, scale);
    }
  });

  return <primitive ref={ref} object={gltf.scene} />;
};

const Star3: React.FC<{ orbitRadius: number; speed: number }> = ({ orbitRadius, speed }) => {
  const gltf = useGLTF('/models/star3.glb');
  const ref = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (ref.current) {
      const time = clock.getElapsedTime();
      const x = orbitRadius * Math.cos(time * speed + (2 * Math.PI) / 3);
      const z = orbitRadius * Math.sin(time * speed + (2 * Math.PI) / 3);
      ref.current.position.set(x, 0, z);

      ref.current.rotation.y = time * 1;
      const scale = 0.5 + Math.abs(Math.sin(time * 2)) * 0.05;
      ref.current.scale.set(scale, scale, scale);
    }
  });

  return <primitive ref={ref} object={gltf.scene} />;
};

const Earth: React.FC<{ position: [number, number, number] }> = ({ position }) => {
  const gltf = useGLTF('/models/earth/scene.gltf');
  const ref = useRef<THREE.Group>(null);

  useFrame(() => {
    if (ref.current) {
      ref.current.rotation.y += 0.008; // 천천히 회전
    }
  });

  return <primitive ref={ref} object={gltf.scene} position={position} scale={2} />;
};

const GltfViewer: React.FC<GltfViewerProps> = ({
  size = { width: '100%', height: '100%' },
}) => {
  return (
    <div style={{ width: size.width, height: size.height }}>
      <Canvas>
        {/* 조명 설정 */}
        <ambientLight intensity={0.8} /> {/* 주변 조명 */}
        <directionalLight position={[5, 5, 5]} intensity={0.5} /> {/* 방향 조명 */}

        {/* GLTF 모델 컴포넌트 */}
        <Earth position={[0, 0, 0]} />
        <Star orbitRadius={3} speed={1} />
        <Star2 orbitRadius={3} speed={1} />
        <Star3 orbitRadius={3} speed={1} />

        {/* 카메라 컨트롤 */}
        <OrbitControls />
      </Canvas>
    </div>
  );
};

export default GltfViewer;
