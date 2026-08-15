'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface FinancialNode3DProps {
  title?: string;
  subtitle?: string;
}

export default function FinancialNode3D({
  title = "3D Wealth Structure Node",
  subtitle = "Interactive 3D visualization of asset allocation & risk horizon"
}: FinancialNode3DProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight || 320;

    // 1. Scene setup
    const scene = new THREE.Scene();
    
    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 5.5;

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // 4. Lighting setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    // Main Gold Directional Light
    const dirLight1 = new THREE.DirectionalLight(0xb8962e, 2.5);
    dirLight1.position.set(5, 5, 5);
    scene.add(dirLight1);

    // Sapphire Accent Light
    const dirLight2 = new THREE.DirectionalLight(0x3b82f6, 3.0);
    dirLight2.position.set(-5, -5, -2);
    scene.add(dirLight2);

    // Emerald Fill Light
    const dirLight3 = new THREE.DirectionalLight(0x10b981, 1.5);
    dirLight3.position.set(0, -5, 5);
    scene.add(dirLight3);

    // 5. Central 3D Gem Geometry (Icosahedron for crystalline wealth look)
    const gemGeometry = new THREE.IcosahedronGeometry(1.2, 0);
    const gemMaterial = new THREE.MeshStandardMaterial({
      color: 0xb8962e,
      metalness: 0.85,
      roughness: 0.15,
      flatShading: true,
    });
    const gemMesh = new THREE.Mesh(gemGeometry, gemMaterial);
    scene.add(gemMesh);

    // Outer Wireframe Cage (Gold Structural Grid)
    const wireGeometry = new THREE.IcosahedronGeometry(1.45, 1);
    const wireMaterial = new THREE.MeshBasicMaterial({
      color: 0x3b82f6,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const wireMesh = new THREE.Mesh(wireGeometry, wireMaterial);
    scene.add(wireMesh);

    // 6. Orbiting Ring Particles (Financial Horizon Ring)
    const particleCount = 120;
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const goldColor = new THREE.Color(0xb8962e);
    const sapphireColor = new THREE.Color(0x3b82f6);

    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const radius = 2.1 + (Math.random() - 0.5) * 0.4;
      
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 0.3;
      positions[i * 3 + 2] = Math.sin(angle) * radius;

      const mixedColor = goldColor.clone().lerp(sapphireColor, Math.random());
      colors[i * 3] = mixedColor.r;
      colors[i * 3 + 1] = mixedColor.g;
      colors[i * 3 + 2] = mixedColor.b;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.06,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
    });
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // Mouse Interaction Parallax Variables
    let mouseX = 0;
    let mouseY = 0;
    let targetRotationX = 0;
    let targetRotationY = 0;

    const handleMouseMove = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;
      mouseX = (x / rect.width) * 2;
      mouseY = (y / rect.height) * 2;
    };

    container.addEventListener('mousemove', handleMouseMove);

    // 7. Animation Loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Smooth rotation
      gemMesh.rotation.y += 0.008;
      gemMesh.rotation.x += 0.004;

      wireMesh.rotation.y -= 0.005;
      wireMesh.rotation.z += 0.003;

      particles.rotation.y += 0.003;

      // Mouse Parallax interpolation
      targetRotationY = mouseX * 0.6;
      targetRotationX = mouseY * 0.6;

      scene.rotation.y += (targetRotationY - scene.rotation.y) * 0.05;
      scene.rotation.x += (targetRotationX - scene.rotation.x) * 0.05;

      renderer.render(scene, camera);
    };

    animate();

    // Responsive Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight || 320;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousemove', handleMouseMove);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      gemGeometry.dispose();
      gemMaterial.dispose();
      wireGeometry.dispose();
      wireMaterial.dispose();
      particleGeometry.dispose();
      particleMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div 
      className="card p-6" 
      style={{ 
        background: 'radial-gradient(circle at center, rgba(59,130,246,0.08) 0%, rgba(5,8,16,0.95) 100%)',
        border: isHovered ? '1px solid var(--brass-500)' : 'var(--border-sapphire)',
        borderRadius: 'var(--radius-xl)',
        position: 'relative',
        overflow: 'hidden',
        transition: 'border-color var(--dur-base), box-shadow var(--dur-base)',
        boxShadow: isHovered ? '0 12px 32px rgba(184,150,46,0.2)' : 'var(--shadow-md)',
        marginBottom: 'var(--sp-6)'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--sp-2)' }}>
        <div>
          <div style={{ fontSize: 'var(--text-2xs)', fontWeight: 700, color: 'var(--brass-400)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '4px' }}>
            ⚡ WebGL 3D Interactive Model
          </div>
          <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, color: 'var(--ink-50)' }}>
            {title}
          </h3>
        </div>
        <span className="badge badge--in-progress" style={{ fontSize: '10px' }}>
          3D Canvas Active
        </span>
      </div>
      
      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-400)', marginBottom: 'var(--sp-4)' }}>
        {subtitle} · Hover & Move cursor to tilt camera perspective in real-time.
      </p>

      {/* 3D WebGL Canvas Container */}
      <div 
        ref={mountRef} 
        style={{ 
          width: '100%', 
          height: '320px', 
          borderRadius: 'var(--radius-lg)', 
          cursor: 'grab',
          position: 'relative',
        }} 
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'var(--sp-4)', paddingTop: 'var(--sp-3)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', gap: 'var(--sp-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', fontSize: 'var(--text-2xs)', color: 'var(--ink-300)' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--brass-500)' }} />
            <span>Wealth Core (Gold)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', fontSize: 'var(--text-2xs)', color: 'var(--ink-300)' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--sapphire-500)' }} />
            <span>Risk Protection Grid</span>
          </div>
        </div>
        <div style={{ fontSize: 'var(--text-2xs)', color: 'var(--ink-500)' }}>
          60 FPS · GPU Accelerated
        </div>
      </div>
    </div>
  );
}
