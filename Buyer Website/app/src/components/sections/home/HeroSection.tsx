import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import * as THREE from 'three';
import { Sparkles } from 'lucide-react';

export default function HeroSection() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const container = canvasRef.current;
    if (!container) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 18;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Helix paths
    function createRibbonPath(phaseOffset: number) {
      const points: THREE.Vector3[] = [];
      for (let i = 0; i <= 200; i++) {
        const t = i / 200;
        const x = (t - 0.5) * 30;
        const y = Math.sin(t * Math.PI * 4 + phaseOffset) * 2.5;
        const z = Math.cos(t * Math.PI * 3 + phaseOffset) * 1.5;
        points.push(new THREE.Vector3(x, y, z));
      }
      return new THREE.CatmullRomCurve3(points);
    }

    const cyanMaterial = new THREE.MeshStandardMaterial({
      color: '#00D4FF', emissive: '#00D4FF', emissiveIntensity: 0.5,
      metalness: 0.8, roughness: 0.2, transparent: true, opacity: 0.9,
    });
    const magentaMaterial = cyanMaterial.clone();
    magentaMaterial.color = new THREE.Color('#E040FB');
    magentaMaterial.emissive = new THREE.Color('#E040FB');

    const cyanPath = createRibbonPath(0);
    const magentaPath = createRibbonPath(Math.PI);
    const cyanGeom = new THREE.TubeGeometry(cyanPath, 200, 0.12, 8, false);
    const magentaGeom = new THREE.TubeGeometry(magentaPath, 200, 0.12, 8, false);
    const cyanRibbon = new THREE.Mesh(cyanGeom, cyanMaterial);
    const magentaRibbon = new THREE.Mesh(magentaGeom, magentaMaterial);
    scene.add(cyanRibbon, magentaRibbon);

    // Sparkles
    const SPARKLE_COUNT = 300;
    const sparkleGeom = new THREE.BufferGeometry();
    const positions = new Float32Array(SPARKLE_COUNT * 3);
    sparkleGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const sparkleMat = new THREE.PointsMaterial({
      size: 0.1, transparent: true, opacity: 1, blending: THREE.AdditiveBlending, depthWrite: false,
      color: new THREE.Color('#FFFFFF'),
    });
    const sparkles = new THREE.Points(sparkleGeom, sparkleMat);
    scene.add(sparkles);

    const time = { value: 0 };
    const speed = { value: 0.4 };
    const point = new THREE.Vector3();

    function animate() {
      frameRef.current = requestAnimationFrame(animate);
      time.value += 0.005 * speed.value;

      const posArr = sparkleGeom.attributes.position.array as Float32Array;
      for (let i = 0; i < SPARKLE_COUNT; i++) {
        const curve = i % 2 === 0 ? cyanPath : magentaPath;
        const t = (i * 0.37 + time.value * (i % 3 === 0 ? 1.2 : 0.8)) % 1;
        curve.getPointAt(t, point);
        posArr[i * 3] = point.x;
        posArr[i * 3 + 1] = point.y;
        posArr[i * 3 + 2] = point.z;
      }
      sparkleGeom.attributes.position.needsUpdate = true;
      renderer.render(scene, camera);
    }

    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(frameRef.current);
      renderer.dispose();
      cyanGeom.dispose(); magentaGeom.dispose();
      cyanMaterial.dispose(); magentaMaterial.dispose();
      sparkleGeom.dispose(); sparkleMat.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Starfield
  const stars = Array.from({ length: 150 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    opacity: Math.random() * 0.6 + 0.2,
    size: Math.random() * 2 + 1,
    duration: Math.random() * 20 + 20,
    driftX: Math.random() * 60 - 30,
    driftY: Math.random() * 40 - 20,
    twinkleDuration: Math.random() * 3 + 2,
  }));

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Three.js Canvas */}
      <div ref={canvasRef} className="absolute inset-0 z-0" />

      {/* Background image fallback */}
      <div className="absolute inset-0 z-0">
        <img src="/images/hero-bg.jpg" alt="" className="w-full h-full object-cover opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050815]/60 via-transparent to-[#050815]" />
      </div>

      {/* Starfield */}
      <div className="absolute inset-0 z-[1] pointer-events-none overflow-hidden">
        {stars.map((star) => (
          <div
            key={star.id}
            className="absolute rounded-full bg-white"
            style={{
              left: star.left, top: star.top,
              width: star.size, height: star.size,
              opacity: star.opacity,
              animation: `drift ${star.duration}s linear infinite, twinkle ${star.twinkleDuration}s ease-in-out infinite`,
              '--drift-x': `${star.driftX}px`,
              '--drift-y': `${star.driftY}px`,
              '--star-opacity': star.opacity,
            } as React.CSSProperties}
          />
        ))}
      </div>

      {/* Floating preview cards */}
      <div className="absolute inset-0 z-[2] pointer-events-none hidden lg:block">
        <div className="absolute top-[20%] left-[8%] w-32 h-24 rounded-lg overflow-hidden glass-surface opacity-60" style={{ animation: 'orbit1 25s ease-in-out infinite' }}>
          <img src="/images/asset-template-1.jpg" alt="" className="w-full h-full object-cover" />
        </div>
        <div className="absolute top-[35%] right-[10%] w-28 h-20 rounded-lg overflow-hidden glass-surface opacity-50" style={{ animation: 'orbit2 30s ease-in-out infinite' }}>
          <img src="/images/asset-image-1.jpg" alt="" className="w-full h-full object-cover" />
        </div>
        <div className="absolute bottom-[25%] left-[12%] w-24 h-18 rounded-lg overflow-hidden glass-surface opacity-40" style={{ animation: 'orbit1 28s ease-in-out infinite reverse' }}>
          <img src="/images/asset-3d-1.jpg" alt="" className="w-full h-full object-cover" />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center page-gutter max-w-4xl mx-auto px-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-surface mb-6">
          <Sparkles size={16} className="text-[#00D4FF]" />
          <span className="text-sm text-[#8892B0]">AI-Powered Creative Marketplace</span>
        </div>

        <h1 className="font-display font-black text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-white mb-4 tracking-wide leading-tight">
          Where Vision Becomes<br />
          <span className="hero-gradient-text">Reality</span>
        </h1>

        <p className="text-lg md:text-xl text-[#8892B0] mb-8 max-w-2xl mx-auto leading-relaxed">
          Premium templates, AI generation, and creative talent — all in one place. 
          Discover 200K+ assets or hire world-class creators.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/ai-studio"
            className="px-8 py-3.5 bg-gradient-to-r from-[#00D4FF] to-[#00A8CC] text-[#050815] font-heading font-bold rounded-button btn-glow hover:brightness-110 transition-all text-center"
          >
            Start Creating Free
          </Link>
          <Link
            to="/explore"
            className="px-8 py-3.5 border border-white/20 text-white font-heading font-semibold rounded-button hover:border-[#00D4FF] hover:text-[#00D4FF] transition-all text-center"
          >
            Explore Assets
          </Link>
        </div>

        <div className="mt-10 flex items-center justify-center gap-6 text-sm text-[#8892B0]">
          <span className="flex items-center gap-1.5">
            <span className="text-[#00D4FF] font-mono font-bold">6000+</span> Projects Delivered
          </span>
          <span className="w-1 h-1 rounded-full bg-[#8892B0]" />
          <span className="flex items-center gap-1.5">
            <span className="text-[#00D4FF] font-mono font-bold">4.9/5</span> Rating
          </span>
          <span className="w-1 h-1 rounded-full bg-[#8892B0]" />
          <span className="flex items-center gap-1.5">
            <span className="text-[#00D4FF] font-mono font-bold">50K+</span> Creators
          </span>
        </div>
      </div>
    </section>
  );
}
