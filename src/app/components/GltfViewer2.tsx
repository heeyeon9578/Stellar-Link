'use client';
import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import * as THREE from 'three'; // THREE 네임스페이스 임포트

const AnimatedModel = () => {
  const gltf = useGLTF('/models/star.glb');
  const ref = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (ref.current) {
      const time = clock.getElapsedTime();

      // Y축 회전
      ref.current.rotation.y = time;

      // 안정적인 Pulse 애니메이션
      const scale = 5 + Math.abs(Math.sin(time * 2)) * 0.5; // 크기 변화 범위 1 ~ 1.1
      ref.current.scale.set(scale, scale, scale);
    }
  });

  return <primitive ref={ref} object={gltf.scene} />;
};

const GltfViewer: React.FC = () => {
  return (
    <div className="w-[10vh] h-[10vh]">
      <Canvas>
        <ambientLight intensity={0.5} />
        <directionalLight position={[1, 1, 1]} />
        <AnimatedModel />
        <OrbitControls enableZoom={false}/>
      </Canvas>
    </div>
  );
};

export default GltfViewer;
