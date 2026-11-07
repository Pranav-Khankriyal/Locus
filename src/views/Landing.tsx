import { useEffect, useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import * as THREE from 'three';
import { useNavigate } from 'react-router-dom';
import { useSession } from '@/hooks/useSession';
import { ShieldCheck, ArrowRight, KeyRound, Sparkles, UserPlus } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const landingColors = { background: '#012824', text: '#CEE9FD' };

// ─── Camera Proxy ──────────────────────────────────────────────────────────────
const cameraProxy = { z: 15, y: 0 };

// ─── 3D Network Scene ──────────────────────────────────────────────────────────
function Network() {
  const group = useRef<THREE.Group>(null);
  const particlesRef = useRef<THREE.Points>(null);
  const nodeCount = 140;

  const nodes = useMemo(() => {
    const temp: THREE.Vector3[] = [];
    for (let i = 0; i < nodeCount; i++) {
      temp.push(
        new THREE.Vector3(
          (Math.random() - 0.5) * 40,
          (Math.random() - 0.5) * 40,
          (Math.random() - 0.5) * 40
        )
      );
    }
    return temp;
  }, []);

  const particlePositions = useMemo(
    () => new Float32Array(500 * 3).map(() => (Math.random() - 0.5) * 80),
    []
  );

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (group.current) {
      group.current.rotation.y = t * 0.05;
      group.current.rotation.z = t * 0.02;
    }
    if (particlesRef.current) {
      particlesRef.current.rotation.y = -t * 0.02;
    }
  });

  return (
    <>
      <group ref={group}>
        {nodes.map((pos, i) => (
          <mesh key={i} position={pos}>
            <sphereGeometry args={[0.18, 12, 12]} />
            <meshBasicMaterial color="#4ade80" />
          </mesh>
        ))}
      </group>

      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[particlePositions, 3]} />
        </bufferGeometry>
        <pointsMaterial size={0.05} color={landingColors.text} transparent opacity={0.4} sizeAttenuation />
      </points>
    </>
  );
}

// ─── Camera Animator (R3F component) ────────────────────────────────────────────
function CameraAnimator() {
  useFrame((state) => {
    state.camera.position.z = cameraProxy.z;
    state.camera.position.y = cameraProxy.y;
    state.camera.lookAt(0, 0, 0);
  });
  return null;
}

// ─── Portal Overlay ──────────────────────────────────────────────────────────────
function PortalOverlay() {
  return (
    <div className="portal-overlay pointer-events-none fixed inset-0 z-10 h-full w-full">
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Where your trust lives">
        <defs>
          <g id="portalWords">
            {['WHERE', 'YOUR TRUST', 'LIVES'].map((word, index) => (
              <text
                key={word}
                x="50%"
                y="50%"
                dy={`${(index - 1) * 0.95}em`}
                textAnchor="middle"
                dominantBaseline="middle"
                style={{ fontSize: 'min(13vw, 22vh)' }}
                fontWeight="900"
                letterSpacing="-0.045em"
              >
                {word}
              </text>
            ))}
          </g>
          <mask id="textMask">
            <rect width="100%" height="100%" fill="white" />
            <use href="#portalWords" className="text-group" fill="black" />
          </mask>
        </defs>
        <rect width="100%" height="100%" fill={landingColors.background} mask="url(#textMask)" />
        <use href="#portalWords" className="text-group portal-lettering" fill={landingColors.text} />
      </svg>
    </div>
  );
}

// ─── App Root ────────────────────────────────────────────────────────────────────
export default function Landing() {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const { login } = useSession();
  const [loggingIn, setLoggingIn] = useState(false);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });
    let animationFrame = 0;
    function raf(time: number) {
      lenis.raf(time);
      animationFrame = requestAnimationFrame(raf);
    }
    animationFrame = requestAnimationFrame(raf);

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: '+=3000',
          scrub: 1,
          pin: true,
        },
      });

      tl.to('.text-group', { scale: 40, transformOrigin: '50% 50%', ease: 'power2.inOut' }, 0);
      tl.to('.portal-lettering', { opacity: 0, duration: 0.35, ease: 'power2.in' }, 0);
      tl.to('.portal-overlay', { autoAlpha: 0, duration: 0.15 }, 0.45);
      tl.to(cameraProxy, { z: 2, y: -2, ease: 'power2.inOut' }, 0);
      tl.fromTo(contentRef.current, { autoAlpha: 0, y: 100 }, { autoAlpha: 1, y: 0, ease: 'power2.out' }, 0.6);
    }, containerRef);

    return () => {
      cancelAnimationFrame(animationFrame);
      lenis.destroy();
      ctx.revert();
    };
  }, []);

  const handleDemoLogin = async () => {
    setLoggingIn(true);
    try {
      await login('admin@lokus.io', 'password123');
      navigate('/dashboard');
    } catch {
      navigate('/login');
    } finally {
      setLoggingIn(false);
    }
  };

  return (
    <main className="relative" style={{ backgroundColor: landingColors.background, color: landingColors.text }}>
      {/* ── Pinned 3D Portal Section ── */}
      <section ref={containerRef} className="relative h-screen w-full overflow-hidden">
        {/* Layer 1 + 2: Three.js Canvas */}
        <div className="absolute inset-0 z-0">
          <Canvas camera={{ position: [0, 0, 15], fov: 45 }}>
            <color attach="background" args={[landingColors.background]} />
            <ambientLight intensity={0.5} />
            <Network />
            <CameraAnimator />
          </Canvas>
        </div>

        {/* Layer 3: SVG Typography Mask Portal */}
        <PortalOverlay />

        {/* Top minimal navigation */}
        <nav
          className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-20 pointer-events-none"
          aria-label="Main navigation"
        >
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span className="text-base font-extrabold tracking-widest text-emerald-400">LOKUS</span>
          </div>
          <div className="flex gap-6 text-sm tracking-widest">
            <button
              onClick={() => navigate('/login')}
              className="pointer-events-auto hover:text-emerald-300 transition-colors font-medium"
            >
              SIGN IN
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="pointer-events-auto hover:text-emerald-300 transition-colors font-medium"
            >
              WORKSPACE
            </button>
          </div>
        </nav>

        {/* Layer 4: App content revealed after portal */}
        <div
          ref={contentRef}
          className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none opacity-0"
        >
          <div className="relative bg-slate-950/85 backdrop-blur-xl border border-slate-800 text-slate-100 w-full max-w-md mx-4 p-8 rounded-2xl shadow-2xl pointer-events-auto">
            <div className="text-center space-y-3 mb-8">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="mx-auto w-16 h-16 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl flex items-center justify-center mb-4"
              >
                <ShieldCheck size={32} className="text-emerald-400" />
              </motion.div>
              <h1 className="text-2xl font-bold tracking-tight text-white">
                Lokus Enterprise Platform
              </h1>
              <p className="text-slate-400 text-sm">
                Cryptographic Identity, RBAC & Asset Verification Engine
              </p>
            </div>

            <div className="space-y-3">
              {/* Demo Sign In Button */}
              <motion.button
                onClick={handleDemoLogin}
                disabled={loggingIn}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full h-12 bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center justify-center gap-3 rounded-xl transition-all duration-200 font-semibold shadow-lg shadow-emerald-500/20"
              >
                <Sparkles size={18} />
                {loggingIn ? 'Entering Workspace...' : 'Quick Demo Sign In (Administrator)'}
              </motion.button>

              {/* Standard Login */}
              <motion.button
                onClick={() => navigate('/login')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full h-12 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 flex items-center justify-center gap-3 rounded-xl transition-colors duration-200 font-medium"
              >
                <KeyRound size={17} className="text-slate-400" />
                Sign In with Credentials
              </motion.button>

              {/* Sign up */}
              <motion.button
                onClick={() => navigate('/signup')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full h-11 bg-transparent hover:bg-slate-900/60 text-slate-400 hover:text-slate-200 flex items-center justify-center gap-2 rounded-xl transition-colors text-xs font-medium"
              >
                <UserPlus size={15} />
                Create a new organization workspace
                <ArrowRight size={14} />
              </motion.button>
            </div>

            <p className="text-center text-xs text-slate-500 mt-6 leading-relaxed">
              Decentralized cryptographic trust & tamper-evident verification. Built without external blockchain overhead.
            </p>
          </div>
        </div>
      </section>

      {/* Spacer to allow GSAP scroll trigger to work */}
      <div className="h-[3000px] w-full" />
    </main>
  );
}
