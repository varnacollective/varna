"use client";

import { useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, OrbitControls, Float, Html, Line } from "@react-three/drei";
import * as THREE from "three";
import Sidebar from "@/components/layout/Sidebar";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

// Minimal glowing connecting line
function ConnectionLine({ start, end }: { start: THREE.Vector3, end: THREE.Vector3 }) {
  const points = useMemo(() => [start, end], [start, end]);
  return (
    <Line points={points} color="white" lineWidth={1} transparent opacity={0.3} />
  );
}

// Fixed-scale annotation tooltip
function FloatingAnnotation({ title, text }: { title: string, text: string }) {
  return (
    <Html center distanceFactor={15} zIndexRange={[100, 0]}>
      <div className="w-64 p-4 bg-[#D8CFB8] text-[#222326] rounded-md shadow-xl pointer-events-none select-none text-left">
        <p className="text-sm font-bold uppercase tracking-widest mb-2 border-b border-[#222326]/20 pb-1">{title}</p>
        <p className="text-xs font-medium leading-relaxed">{text}</p>
      </div>
    </Html>
  );
}

function FrameworkScene() {
  const centerPos = useMemo(() => new THREE.Vector3(0, 0, 0), []);
  const impactPos = useMemo(() => new THREE.Vector3(-5, 3, 0), []);
  const readinessPos = useMemo(() => new THREE.Vector3(5, 2, 0), []);
  const riskPos = useMemo(() => new THREE.Vector3(0, -4, 2), []);

  const glassProps = {
    transmission: 0.9,
    opacity: 1,
    metalness: 0.1,
    roughness: 0.1,
    ior: 1.5,
    thickness: 2,
    clearcoat: 1,
    transparent: true,
  };

  const centerRef = useRef<THREE.Mesh>(null!);

  useFrame((state, delta) => {
    if (centerRef.current) {
      centerRef.current.rotation.y += delta * 0.25;
      centerRef.current.rotation.x += delta * 0.15;
    }
  });

  return (
    <>
      <Environment preset="city" environmentIntensity={1.5} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={2} />
      <spotLight position={[10, 10, 10]} angle={0.2} penumbra={1} intensity={1} castShadow />

      {/* Impact (50%) - Sphere */}
      <Float speed={1.5} rotationIntensity={0.5} floatIntensity={1}>
        <group position={impactPos}>
          <mesh>
            <sphereGeometry args={[1, 64, 64]} />
            <meshPhysicalMaterial color="#738678" emissive="#738678" emissiveIntensity={0.3} {...glassProps} />
          </mesh>
          <FloatingAnnotation title="Impact (50%)" text="What the enterprise actually does. Evaluates environmental practices, social impact, governance, and cultural heritage." />
        </group>
      </Float>

      {/* Readiness (30%) - Cube */}
      <Float speed={2} rotationIntensity={1} floatIntensity={1.5}>
        <group position={readinessPos}>
          <mesh>
            <boxGeometry args={[1.3, 1.3, 1.3]} />
            <meshPhysicalMaterial color="#6F848F" emissive="#6F848F" emissiveIntensity={0.3} {...glassProps} />
          </mesh>
          <FloatingAnnotation title="Readiness (30%)" text="How well practices are managed. Evaluates tracking, documentation, and systematic processes." />
        </group>
      </Float>

      {/* Risk (20%) - Tetrahedron */}
      <Float speed={1.2} rotationIntensity={0.8} floatIntensity={1.2}>
        <group position={riskPos}>
          <mesh>
            <tetrahedronGeometry args={[1.2]} />
            <meshPhysicalMaterial color="#7A3F1E" emissive="#7A3F1E" emissiveIntensity={0.3} {...glassProps} />
          </mesh>
          <FloatingAnnotation title="Risk (20%)" text="Compliance and reliability. Starts at 100, with deductions applied for regulatory gaps or material risk." />
        </group>
      </Float>

      {/* Center - Final Score - Octahedron */}
      <Float speed={1} rotationIntensity={0.2} floatIntensity={0.5}>
        <group position={centerPos}>
          <mesh ref={centerRef}>
            <octahedronGeometry args={[1.8, 0]} />
            <meshPhysicalMaterial color="#D8CFB8" emissive="#D8CFB8" emissiveIntensity={0.4} {...glassProps} />
          </mesh>
          <FloatingAnnotation title="Final Varna Score" text="A Force for Good, Built into Every Purchase." />
        </group>
      </Float>

      {/* Connection Lines */}
      <ConnectionLine start={impactPos} end={centerPos} />
      <ConnectionLine start={readinessPos} end={centerPos} />
      <ConnectionLine start={riskPos} end={centerPos} />
    </>
  );
}

export default function AlgorithmPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  const handleSectionChange = (section: string) => {
    if (section !== "algorithm") {
      if (section === "suppliers") {
        router.push("/dashboard/suppliers");
      } else {
        router.push(`/dashboard?section=${section}`);
      }
    }
  };

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    localStorage.removeItem("varna_client");
    router.push("/");
  };

  return (
    <div className="min-h-screen flex bg-[#F9F9F8] dark:bg-carbon-ink font-sans selection:bg-deep-clay selection:text-warm-stone">
      <Sidebar
        activeSection="algorithm"
        onSectionChange={handleSectionChange}
        onLogout={handleLogout}
      />

      <main className="flex-1 ml-24 relative">
        
        {/* Floating Theme Toggle */}
        <div className="fixed top-8 right-8 z-50">
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 border border-slate-mist/30 text-warm-stone/50 hover:text-warm-stone bg-carbon-ink/50 backdrop-blur-md transition-colors"
            title="Toggle theme"
          >
            {theme === "dark" ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* 1. Hero Section (3D Visualization) */}
        <section className="relative h-screen w-full bg-carbon-ink text-warm-stone">
          <div className="absolute top-12 left-12 z-10 pointer-events-none">
            <h1 className="text-4xl font-serif font-light tracking-tighter text-warm-stone leading-tight mb-3">
              The Varna Framework
            </h1>
            <p className="text-xs uppercase tracking-widest text-warm-stone/50 font-light">
              Algorithm Visualization
            </p>
          </div>
          
          <Canvas camera={{ position: [0, 0, 11], fov: 45 }}>
            <FrameworkScene />
            <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
          </Canvas>
          
          {/* Scroll Down Indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-[9px] uppercase tracking-widest text-warm-stone/40 animate-pulse pointer-events-none">
            Scroll to read
          </div>
        </section>

        {/* 2. Scrollable Narrative Content */}
        
        {/* Intro Block */}
        <section className="py-24 px-12 md:px-24 bg-[#F9F9F8] text-carbon-ink dark:bg-carbon-ink dark:text-warm-stone text-center border-b border-slate-mist/20">
          <p className="text-2xl md:text-3xl font-serif font-light leading-relaxed max-w-4xl mx-auto">
            What is the Varna Framework? India's first sustainability credentialing standard designed specifically for small and micro enterprises. Built for enterprises that conventional ESG frameworks overlook—and for buyers who need more than a checkbox.
          </p>
        </section>

        {/* Section 1: The Three Principles */}
        <section className="py-24 px-12 md:px-24 bg-white dark:bg-[#2A2B2E]">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-mist dark:text-warm-stone/50 mb-12 text-center">
            Section 1 &bull; The Three Principles
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-6xl mx-auto">
            <div className="border-t border-carbon-ink/10 dark:border-warm-stone/10 pt-6">
              <h3 className="text-xl font-serif text-carbon-ink dark:text-warm-stone mb-4 tracking-tight">Objective</h3>
              <p className="text-sm text-carbon-ink/70 dark:text-warm-stone/70 font-light leading-relaxed">
                Every score comes from actual data mapped to defined bands—not assessor opinion.
              </p>
            </div>
            <div className="border-t border-carbon-ink/10 dark:border-warm-stone/10 pt-6">
              <h3 className="text-xl font-serif text-carbon-ink dark:text-warm-stone mb-4 tracking-tight">Calibrated</h3>
              <p className="text-sm text-carbon-ink/70 dark:text-warm-stone/70 font-light leading-relaxed">
                Scoring is adjusted for enterprise size and age.
              </p>
            </div>
            <div className="border-t border-carbon-ink/10 dark:border-warm-stone/10 pt-6">
              <h3 className="text-xl font-serif text-carbon-ink dark:text-warm-stone mb-4 tracking-tight">Developmental</h3>
              <p className="text-sm text-carbon-ink/70 dark:text-warm-stone/70 font-light leading-relaxed">
                The framework is a starting point, not a verdict. Every score comes with a roadmap to improve it.
              </p>
            </div>
          </div>
        </section>

        {/* Section 2: The Formula Breakdown */}
        <section className="py-24 px-12 md:px-24 bg-[#F9F9F8] dark:bg-carbon-ink border-t border-slate-mist/20">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-mist dark:text-warm-stone/50 mb-12">
              Section 2 &bull; The Formula Breakdown
            </h2>
            <div className="space-y-12">
              <div className="flex gap-8 items-start">
                <div className="w-16 h-16 rounded-full bg-[#738678]/10 border border-[#738678]/30 flex items-center justify-center flex-shrink-0 text-[#738678] font-serif text-2xl">50</div>
                <div>
                  <h3 className="text-2xl font-serif text-carbon-ink dark:text-warm-stone mb-3">Impact (50%)</h3>
                  <p className="text-base text-carbon-ink/70 dark:text-warm-stone/70 font-light leading-relaxed">
                    What your enterprise actually does. Split across Environmental, Social, Governance, and Cultural dimensions.
                  </p>
                </div>
              </div>
              <div className="flex gap-8 items-start">
                <div className="w-16 h-16 rounded-full bg-[#6F848F]/10 border border-[#6F848F]/30 flex items-center justify-center flex-shrink-0 text-[#6F848F] font-serif text-2xl">30</div>
                <div>
                  <h3 className="text-2xl font-serif text-carbon-ink dark:text-warm-stone mb-3">Readiness (30%)</h3>
                  <p className="text-base text-carbon-ink/70 dark:text-warm-stone/70 font-light leading-relaxed">
                    How well you manage and document your sustainability practices.
                  </p>
                </div>
              </div>
              <div className="flex gap-8 items-start">
                <div className="w-16 h-16 rounded-full bg-[#7A3F1E]/10 border border-[#7A3F1E]/30 flex items-center justify-center flex-shrink-0 text-[#7A3F1E] font-serif text-2xl">20</div>
                <div>
                  <h3 className="text-2xl font-serif text-carbon-ink dark:text-warm-stone mb-3">Risk (20%)</h3>
                  <p className="text-base text-carbon-ink/70 dark:text-warm-stone/70 font-light leading-relaxed">
                    Your regulatory compliance status and data reliability. Deductions apply only for verified compliance issues.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: The Multiplier Effect */}
        <section className="py-24 px-12 md:px-24 bg-carbon-ink text-warm-stone">
          <div className="max-w-6xl mx-auto text-center">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-mist/70 mb-16">
              Section 3 &bull; The Multiplier Effect
            </h2>
            
            <div className="flex flex-col md:flex-row justify-center items-center gap-4 mb-16 overflow-x-auto pb-4">
              <div className="px-6 py-4 border border-warm-stone/20 bg-warm-stone/5 font-serif text-lg whitespace-nowrap">Actual Data</div>
              <div className="text-warm-stone/40">→</div>
              <div className="px-6 py-4 border border-warm-stone/20 bg-warm-stone/5 font-serif text-lg whitespace-nowrap">Band Lookup</div>
              <div className="text-warm-stone/40">→</div>
              <div className="px-6 py-4 border border-warm-stone/20 bg-warm-stone/10 font-serif text-lg whitespace-nowrap">Raw Score</div>
              <div className="text-warm-stone/40">→</div>
              <div className="px-6 py-4 border border-deep-clay/50 bg-deep-clay/20 font-serif text-lg text-warm-stone whitespace-nowrap shadow-[0_0_20px_rgba(122,63,30,0.3)]">Evidence Multiplier</div>
              <div className="text-warm-stone/40">→</div>
              <div className="px-6 py-4 border border-warm-stone/40 bg-warm-stone/20 font-serif text-xl whitespace-nowrap font-semibold">Effective Score</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-16 text-left">
              <div className="p-6 border border-warm-stone/10 bg-black/20">
                <div className="text-2xl font-serif text-deep-clay mb-2">0.5x</div>
                <div className="text-xs uppercase tracking-wider mb-2 font-semibold">None / Proxy</div>
                <p className="text-xs font-light text-warm-stone/60">Data is estimated or absent.</p>
              </div>
              <div className="p-6 border border-warm-stone/10 bg-black/20">
                <div className="text-2xl font-serif text-slate-mist mb-2">0.75x</div>
                <div className="text-xs uppercase tracking-wider mb-2 font-semibold">Self-Reported</div>
                <p className="text-xs font-light text-warm-stone/60">Data is claimed but unaudited.</p>
              </div>
              <div className="p-6 border border-warm-stone/10 bg-black/20">
                <div className="text-2xl font-serif text-sage-mineral mb-2">1.0x</div>
                <div className="text-xs uppercase tracking-wider mb-2 font-semibold">Third-Party Verified</div>
                <p className="text-xs font-light text-warm-stone/60">Data is backed by certified documentation.</p>
              </div>
            </div>

            <p className="text-3xl font-serif font-light text-warm-stone/90 italic">
              "The score is not a judgment. It is a calculation."
            </p>
          </div>
        </section>

        {/* Section 4: Performance Bands */}
        <section className="py-24 px-12 md:px-24 bg-white dark:bg-[#2A2B2E]">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-mist dark:text-warm-stone/50 mb-12 text-center">
              Section 4 &bull; Performance Bands
            </h2>
            <div className="space-y-4">
              {[
                { title: "Varna Leader", range: "85 - 100", color: "border-deep-clay", text: "text-deep-clay" },
                { title: "Advanced", range: "70 - 84", color: "border-sage-mineral", text: "text-sage-mineral" },
                { title: "Emerging", range: "55 - 69", color: "border-slate-mist", text: "text-slate-mist" },
                { title: "Foundational", range: "40 - 54", color: "border-carbon-ink dark:border-warm-stone/40", text: "text-carbon-ink dark:text-warm-stone" },
                { title: "Not Ready", range: "Below 40", color: "border-red-900/40", text: "text-red-900/60 dark:text-red-400/60" },
              ].map((band) => (
                <div key={band.title} className={`flex justify-between items-center p-6 border-l-4 ${band.color} bg-[#F9F9F8] dark:bg-black/10`}>
                  <h3 className={`text-xl font-serif ${band.text}`}>{band.title}</h3>
                  <div className="text-sm font-sans tracking-widest font-light text-carbon-ink/60 dark:text-warm-stone/60">{band.range}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
