import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, PerspectiveCamera } from '@react-three/drei';

function CapModel({ scrollProgress }) {
  const capRef = useRef();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Track mouse movement for subtle hover parallax
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useFrame((state) => {
    if (!capRef.current) return;

    // Base rotation + mouse hover reaction + scroll progress rotation
    const targetY = mousePos.x * 0.4 + (scrollProgress * Math.PI * 2);
    const targetX = -mousePos.y * 0.3 + 0.2; // slight tilt down

    // Smoothly interpolate rotations (Lerp)
    capRef.current.rotation.y += (targetY - capRef.current.rotation.y) * 0.05;
    capRef.current.rotation.x += (targetX - capRef.current.rotation.x) * 0.05;

    // Hover floating height variation
    capRef.current.position.y = Math.sin(state.clock.getElapsedTime() * 1.5) * 0.15;
  });

  return (
    <group ref={capRef} scale={1.2}>
      {/* 1. Core Globe - Golden Solid Sphere */}
      <mesh castShadow receiveShadow>
        <sphereGeometry args={[1.0, 32, 32]} />
        <meshStandardMaterial 
          color="#D4AF37" 
          roughness={0.1} 
          metalness={0.9} 
        />
      </mesh>

      {/* 2. Globe Grid - Wireframe Sphere slightly larger */}
      <mesh>
        <sphereGeometry args={[1.02, 16, 16]} />
        <meshStandardMaterial 
          color="#FFFFFF" 
          roughness={0.2} 
          metalness={0.5} 
          wireframe
        />
      </mesh>

      {/* 3. Orbit Ring (Saturn-like Ring) - Curved golden ring */}
      <mesh castShadow receiveShadow rotation={[Math.PI / 3, 0.2, 0]}>
        <torusGeometry args={[1.6, 0.06, 16, 100]} />
        <meshStandardMaterial 
          color="#D4AF37" 
          roughness={0.15} 
          metalness={0.95} 
        />
      </mesh>

      {/* Outer secondary slim ring */}
      <mesh rotation={[Math.PI / 3, 0.2, 0]}>
        <torusGeometry args={[1.75, 0.015, 8, 100]} />
        <meshStandardMaterial 
          color="#D4AF37" 
          roughness={0.1} 
          metalness={0.9} 
        />
      </mesh>

      {/* 4. Mini orbiting star sparks (Logo style) */}
      <group rotation={[0.2, 0, 0.2]}>
        {/* Top Star */}
        <mesh position={[0, 1.4, 0]}>
          <octahedronGeometry args={[0.08, 0]} />
          <meshStandardMaterial color="#FFFFFF" roughness={0.1} metalness={0.8} emissive="#D4AF37" emissiveIntensity={0.5} />
        </mesh>
        {/* Left top star */}
        <mesh position={[-1.1, 1.0, -0.2]}>
          <octahedronGeometry args={[0.06, 0]} />
          <meshStandardMaterial color="#FFFFFF" roughness={0.1} metalness={0.8} />
        </mesh>
        {/* Right top star */}
        <mesh position={[1.1, 1.0, 0.2]}>
          <octahedronGeometry args={[0.06, 0]} />
          <meshStandardMaterial color="#FFFFFF" roughness={0.1} metalness={0.8} />
        </mesh>
        {/* Bottom stars */}
        <mesh position={[-0.4, -1.3, 0]}>
          <octahedronGeometry args={[0.05, 0]} />
          <meshStandardMaterial color="#FFFFFF" roughness={0.1} metalness={0.8} />
        </mesh>
        <mesh position={[0.4, -1.3, 0]}>
          <octahedronGeometry args={[0.05, 0]} />
          <meshStandardMaterial color="#FFFFFF" roughness={0.1} metalness={0.8} />
        </mesh>
      </group>
    </group>
  );
}

export default function Cap3D() {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        setScrollProgress(window.scrollY / totalScroll);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="w-full h-full relative cursor-grab active:cursor-grabbing">
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[0, 0, 4.5]} fov={50} />
        
        {/* Lighting system */}
        <ambientLight intensity={0.6} />
        <directionalLight 
          position={[5, 10, 5]} 
          intensity={1.8} 
          castShadow 
          shadow-mapSize-width={1024} 
          shadow-mapSize-height={1024} 
        />
        <pointLight position={[-5, 5, 2]} intensity={1.2} color="#D4AF37" />
        <pointLight position={[3, -2, 5]} intensity={1.0} color="#FFFFFF" />
        <spotLight position={[0, 10, 0]} intensity={1.5} angle={0.4} penumbra={1} />
        
        <CapModel scrollProgress={scrollProgress} />
        
        <OrbitControls 
          enableZoom={false} 
          enablePan={false}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 1.8}
        />
      </Canvas>
      {/* Absolute overlay for "URBAN GOLD" brand text */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center pointer-events-none select-none">
        <h2 className="text-4xl sm:text-5xl font-black tracking-[0.25em] bg-gradient-to-r from-urbangold-gold via-[#FFF0A5] to-urbangold-gold bg-clip-text text-transparent drop-shadow-[0_4px_12px_rgba(212,175,55,0.4)] uppercase font-sans">
          URBAN GOLD
        </h2>
      </div>
    </div>
  );
}
