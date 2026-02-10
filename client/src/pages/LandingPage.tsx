import { motion, useScroll, useTransform, useSpring, useInView } from 'framer-motion';
import { useLocation } from 'wouter';
import { Shield, ArrowRight, Activity, Cpu, Scan, Cloud, Radio, Eye, Server, ChevronDown, Zap, Crosshair, Map as MapIcon, Database, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRef, useState, useEffect } from 'react';
import CinematicBackground from '@/components/CinematicBackground';
import { ScrollProgress } from '@/components/ui/ScrollProgress';
import { TextReveal } from '@/components/ui/TextReveal';
import { TiltCard } from '@/components/ui/TiltCard';
import { cn } from '@/lib/utils'; // Assuming you have this utility

// --- SUB-COMPONENTS ---

const Section = ({ children, className, id }: { children: React.ReactNode, className?: string, id?: string }) => (
    <section id={id} className={cn("min-h-screen relative flex items-center justify-center py-24 overflow-hidden", className)}>
        {children}
    </section>
);

const RevealCard = ({ children, delay = 0, className }: { children: React.ReactNode, delay?: number, className?: string }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-10% 0px" });

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 50 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }} // Custom ease
            className={className}
        >
            {children}
        </motion.div>
    );
};

const MagneticButton = ({ children, onClick, className }: { children: React.ReactNode, onClick?: () => void, className?: string }) => {
    const ref = useRef<HTMLButtonElement>(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });

    const handleMouseMove = (e: React.MouseEvent) => {
        const { clientX, clientY } = e;
        const { left, top, width, height } = ref.current?.getBoundingClientRect() || { left: 0, top: 0, width: 0, height: 0 };
        const x = clientX - (left + width / 2);
        const y = clientY - (top + height / 2);
        setPosition({ x: x * 0.1, y: y * 0.1 });
    };

    const handleMouseLeave = () => {
        setPosition({ x: 0, y: 0 });
    };

    return (
        <motion.button
            ref={ref}
            animate={{ x: position.x, y: position.y }}
            transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={onClick}
            className={className}
        >
            {children}
        </motion.button>
    );
};

// --- MAIN PAGE ---

export default function LandingPage() {
    const [_, setLocation] = useLocation();
    const { scrollYProgress } = useScroll();

    // Smooth Parallax
    const yHero = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
    const opacityHero = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

    const drones = [
        { name: "S-1 SCOUT", role: "RECON", speed: "120km/h", range: "15km", icon: Eye },
        { name: "I-4 INTERCEPTOR", role: "PURSUIT", speed: "240km/h", range: "8km", icon: Crosshair },
        { name: "H-9 GOLIATH", role: "LOGISTICS", speed: "80km/h", range: "40km", icon: Server },
    ];

    const architectureSteps = [
        { title: "SENSORY GRID", desc: "4K RTSP Ingest", icon: Eye },
        { title: "NEURAL CORE", desc: "YOLOv8 Inference", icon: Cpu },
        { title: "SYNAPSE BUS", desc: "WebSocket Telemetry", icon: Activity },
        { title: "COMMAND LINK", desc: "Autonomous Response", icon: Radio },
    ];

    return (
        <div className="bg-black text-white font-sans selection:bg-green-500/30 overflow-x-hidden">
            <ScrollProgress />

            {/* --- HERO SECTION --- */}
            <Section className="h-screen relative z-10">
                <CinematicBackground />
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black pointer-events-none" />

                <motion.div style={{ y: yHero, opacity: opacityHero }} className="relative z-20 text-center px-6">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-green-500/20 bg-green-500/10 backdrop-blur-md"
                    >
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        <span className="text-xs font-mono text-green-400 tracking-widest uppercase">System Online // v3.2.0</span>
                    </motion.div>

                    <h1 className="text-7xl md:text-9xl font-black tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/50 drop-shadow-2xl">
                        <TextReveal>AUTONOMOUS</TextReveal><br />
                        <TextReveal>SHIELD</TextReveal>
                    </h1>

                    <p className="text-xl md:text-2xl text-zinc-400 max-w-2xl mx-auto font-light leading-relaxed mb-12">
                        Next-generation perimeter defense powered by logic-gated AI.
                        <br /><span className="text-green-500 font-mono text-sm uppercase tracking-widest">[ BEYOND HUMAN REACTION TIME ]</span>
                    </p>

                    <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
                        <MagneticButton
                            onClick={() => setLocation('/system')}
                            className="group relative px-8 py-4 bg-white text-black font-bold text-lg rounded-none clip-path-slant hover:bg-green-400 transition-colors duration-300"
                        >
                            <span className="flex items-center gap-2">
                                INITIALIZE SYSTEM
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </span>
                        </MagneticButton>
                        <Button variant="ghost" className="text-zinc-500 hover:text-white font-mono tracking-widest" onClick={() => document.getElementById('architecture')?.scrollIntoView({ behavior: 'smooth' })}>
                            VIEW_BLUEPRINT v1.0
                        </Button>
                    </div>
                </motion.div>

                <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute bottom-10 left-1/2 -translate-x-1/2 text-zinc-600"
                >
                    <ChevronDown className="w-8 h-8 opacity-50" />
                </motion.div>
            </Section>

            {/* --- NEURAL CORE --- */}
            <Section className="bg-zinc-950 border-t border-white/5">
                <div className="max-w-7xl mx-auto px-6 w-full">
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <RevealCard>
                            <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">
                                <span className="text-green-500"><TextReveal>NEURAL CORE</TextReveal></span>
                            </h2>
                            <p className="text-zinc-400 text-lg leading-relaxed mb-8 border-l-2 border-green-500/50 pl-6">
                                Powered by a custom-tuned YOLOv8 engine, the system processes 4K video streams in real-time, identifying threats with 98.4% confidence before they breach the perimeter.
                            </p>
                            <ul className="space-y-4 font-mono text-sm text-zinc-500">
                                <li className="flex items-center gap-3">
                                    <div className="w-1.5 h-1.5 bg-green-500 shadow-[0_0_8px_#22c55e]" />
                                    20ms Inference Latency
                                </li>
                                <li className="flex items-center gap-3">
                                    <div className="w-1.5 h-1.5 bg-green-500 shadow-[0_0_8px_#22c55e]" />
                                    Multi-Class Object Detection
                                </li>
                                <li className="flex items-center gap-3">
                                    <div className="w-1.5 h-1.5 bg-green-500 shadow-[0_0_8px_#22c55e]" />
                                    Behavioral Anomaly Analysis
                                </li>
                            </ul>
                        </RevealCard>

                        <div className="relative h-[400px] w-full bg-zinc-900/50 rounded-2xl border border-white/5 overflow-hidden group">
                            {/* Simulated Neural Network Animation */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Scan className="w-32 h-32 text-green-500/20 group-hover:text-green-500/40 transition-colors duration-500" />
                            </div>
                            <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none">
                                <defs>
                                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
                                    </pattern>
                                </defs>
                                <rect width="100%" height="100%" fill="url(#grid)" />
                            </svg>
                            {/* Scanning Line */}
                            <motion.div
                                animate={{ top: ["0%", "100%"] }}
                                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                className="absolute left-0 w-full h-1 bg-green-500/50 shadow-[0_0_20px_#22c55e]"
                            />
                        </div>
                    </div>
                </div>
            </Section>

            {/* --- DRONE FLEET --- */}
            <Section className="bg-black relative">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-900 via-black to-black opacity-50" />
                <div className="max-w-7xl mx-auto px-6 w-full relative z-10">
                    <RevealCard className="text-center mb-16">
                        <span className="text-green-500 font-mono tracking-widest uppercase text-sm">Hardware Assets</span>
                        <h2 className="text-5xl font-black mt-2">
                            <TextReveal>ACTIVE SQUADRON</TextReveal>
                        </h2>
                    </RevealCard>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {drones.map((drone, i) => (
                            <RevealCard key={i} delay={i * 0.1}>
                                <TiltCard className="h-full">
                                    <div className="group relative h-80 bg-zinc-900/40 border border-white/10 rounded-xl p-8 hover:bg-zinc-800/40 transition-all duration-500 overflow-hidden h-full">
                                        <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-100 transition-opacity">
                                            <drone.icon className="w-12 h-12 text-white" />
                                        </div>
                                        <div className="mt-auto h-full flex flex-col justify-end">
                                            <h3 className="text-2xl font-bold mb-2">{drone.name}</h3>
                                            <p className="text-green-500 font-mono text-sm mb-6">{drone.role} CLASS</p>

                                            <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-4">
                                                <div>
                                                    <div className="text-xs text-zinc-500 uppercase">Speed</div>
                                                    <div className="text-lg font-mono">{drone.speed}</div>
                                                </div>
                                                <div>
                                                    <div className="text-xs text-zinc-500 uppercase">Range</div>
                                                    <div className="text-lg font-mono">{drone.range}</div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="absolute inset-0 border-2 border-green-500/0 group-hover:border-green-500/20 rounded-xl transition-all duration-500" />
                                    </div>
                                </TiltCard>
                            </RevealCard>
                        ))}
                    </div>
                </div>
            </Section>

            {/* --- ARCHITECTURE --- */}
            <Section id="architecture" className="bg-zinc-950 border-y border-white/5">
                <div className="max-w-7xl mx-auto px-6 w-full">
                    <RevealCard className="mb-20">
                        <h2 className="text-4xl font-bold mb-4">SYSTEM ARCHITECTURE</h2>
                        <p className="text-zinc-500 max-w-xl">
                            A breakdown of the data pipeline. Information travels from lens to logic in under 50 milliseconds using an optimized WebSocket bus.
                        </p>
                    </RevealCard>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
                        {/* Connecting Line */}
                        <div className="hidden md:block absolute top-12 left-0 right-0 h-[2px] bg-zinc-800 -z-10" />

                        {architectureSteps.map((step, i) => (
                            <RevealCard key={i} delay={i * 0.2}>
                                <div className="bg-black border border-white/10 p-6 rounded-2xl relative z-10 hover:-translate-y-2 transition-transform duration-300">
                                    <div className="w-12 h-12 bg-zinc-900 rounded-lg flex items-center justify-center mb-6 border border-white/5">
                                        <step.icon className="w-6 h-6 text-green-500" />
                                    </div>
                                    <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                                    <p className="text-sm text-zinc-500">{step.desc}</p>

                                    <div className="absolute top-0 right-0 text-[100px] font-black text-white/[0.02] -z-10 leading-none -mt-4 -mr-4 pointer-events-none">
                                        {i + 1}
                                    </div>
                                </div>
                            </RevealCard>
                        ))}
                    </div>
                </div>
            </Section>

            {/* --- SECTION 1: GLOBAL THREAT INTELLIGENCE --- */}
            <Section className="bg-black relative border-t border-white/10">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
                <div className="max-w-7xl mx-auto px-6 w-full relative z-10">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <RevealCard>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-mono mb-6">
                                <Activity className="w-3 h-3" />
                                LIVE THREAT MONITORING
                            </div>
                            <h2 className="text-4xl md:text-5xl font-black mb-6">GLOBAL <span className="text-zinc-600">INTEL</span> GRID</h2>
                            <p className="text-zinc-400 text-lg leading-relaxed mb-8">
                                Autonomous Shield doesn't just watch locally. It aggregates threat signatures from 14 sovereign borders to predict incursions before they happen.
                            </p>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="p-4 bg-zinc-900 rounded-lg border border-white/5">
                                    <div className="text-3xl font-black text-white mb-1">14,203</div>
                                    <div className="text-xs text-zinc-500 uppercase tracking-widest">Threats Neutralized</div>
                                </div>
                                <div className="p-4 bg-zinc-900 rounded-lg border border-white/5">
                                    <div className="text-3xl font-black text-white mb-1">99.9%</div>
                                    <div className="text-xs text-zinc-500 uppercase tracking-widest">Uptime SLA</div>
                                </div>
                            </div>
                        </RevealCard>

                        <RevealCard delay={0.2} className="relative aspect-square bg-zinc-900/50 rounded-full border border-white/5 flex items-center justify-center p-12">
                            {/* Abstract Globe/Map Representation */}
                            <div className="absolute inset-0 rounded-full border border-white/5 animate-[spin_60s_linear_infinite]" />
                            <div className="absolute inset-12 rounded-full border border-dashed border-white/10 animate-[spin_40s_linear_infinite_reverse]" />
                            <div className="absolute inset-24 rounded-full border border-white/5 animate-[spin_20s_linear_infinite]" />
                            <MapIcon className="w-32 h-32 text-zinc-800" />

                            {/* Hotspots */}
                            <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-red-500 rounded-full animate-ping" />
                            <div className="absolute bottom-1/3 right-1/4 w-2 h-2 bg-red-500 rounded-full animate-ping delay-700" />
                            <div className="absolute top-1/2 right-1/3 w-2 h-2 bg-red-500 rounded-full animate-ping delay-300" />
                        </RevealCard>
                    </div>
                </div>
            </Section>

            {/* --- SECTION 2: MILITARY-GRADE ENCRYPTION --- */}
            <Section className="bg-zinc-950">
                <div className="max-w-4xl mx-auto px-6 w-full text-center">
                    <RevealCard>
                        <Lock className="w-16 h-16 text-green-500 mx-auto mb-8" />
                        <h2 className="text-4xl md:text-5xl font-black mb-6">ZERO-TRUST <span className="text-white">SECURITY</span></h2>
                        <p className="text-xl text-zinc-400 leading-relaxed mb-12">
                            Every byte of telemetry is encrypted with AES-256 before it leaves the sensor.
                            Our proprietary "Synapse" protocol ensures that even if a node is physically compromised, the network remains impenetrable.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            {['End-to-End Encryption', 'Rotating Keys', 'Air-Gapped Core', 'Biometric Auth'].map((tag, i) => (
                                <span key={i} className="px-4 py-2 bg-zinc-900 border border-white/10 rounded-lg text-sm font-mono text-zinc-300">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </RevealCard>
                </div>
            </Section>

            {/* --- SECTION 3: 'THE OBSERVER' AI MODELS --- */}
            <Section className="bg-black border-y border-white/10">
                <div className="max-w-7xl mx-auto px-6 w-full">
                    <div className="flex flex-col md:flex-row gap-16">
                        <div className="flex-1">
                            <RevealCard>
                                <h2 className="text-4xl font-black mb-6 uppercase">The <span className="text-blue-500">Observer</span> Engine</h2>
                                <p className="text-zinc-400 mb-8">
                                    Unlike generic computer vision, 'The Observer' is fine-tuned on <span className="text-white font-bold">2.5 million</span> localized threat scenarios. It distinguishes between a stray dog and a crawling combatant in low-light conditions.
                                </p>
                                <div className="space-y-6">
                                    <div>
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="text-zinc-500">Human Detection Accuracy</span>
                                            <span className="text-green-500 font-mono">99.2%</span>
                                        </div>
                                        <div className="h-2 bg-zinc-900 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                whileInView={{ width: "99.2%" }}
                                                transition={{ duration: 1.5, ease: "easeOut" }}
                                                className="h-full bg-green-500"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="text-zinc-500">Weapon Classification</span>
                                            <span className="text-blue-500 font-mono">96.8%</span>
                                        </div>
                                        <div className="h-2 bg-zinc-900 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                whileInView={{ width: "96.8%" }}
                                                transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                                                className="h-full bg-blue-500"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="text-zinc-500">False Positive Rate</span>
                                            <span className="text-red-500 font-mono">0.02%</span>
                                        </div>
                                        <div className="h-2 bg-zinc-900 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: "100%" }}
                                                whileInView={{ width: "0.2%" }}
                                                transition={{ duration: 1.5, ease: "easeOut", delay: 0.4 }}
                                                className="h-full bg-red-500"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </RevealCard>
                        </div>
                        <div className="flex-1 grid grid-cols-2 gap-4">
                            {['YOLOv8-L', 'ResNet-50', 'DeepSort', 'Custom-CNN'].map((model, i) => (
                                <RevealCard key={i} delay={i * 0.1} className="p-6 bg-zinc-900/50 border border-white/5 rounded-xl flex flex-col items-center justify-center text-center hover:bg-zinc-800 transition-colors">
                                    <Cpu className="w-8 h-8 text-zinc-600 mb-4" />
                                    <div className="font-bold text-lg">{model}</div>
                                    <div className="text-xs text-zinc-500 mt-2">Active Module</div>
                                </RevealCard>
                            ))}
                        </div>
                    </div>
                </div>
            </Section>

            {/* --- SECTION 4: HARDWARE ECOSYSTEM --- */}
            <Section className="bg-zinc-950">
                <div className="max-w-7xl mx-auto px-6 w-full text-center">
                    <RevealCard className="mb-16">
                        <span className="text-green-500 font-mono uppercase tracking-widest text-sm">Agnostic Integration</span>
                        <h2 className="text-4xl md:text-5xl font-black mt-2">SENSOR <span className="text-white">ECOSYSTEM</span></h2>
                    </RevealCard>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { icon: Eye, label: "Optical", desc: "4K Visible Light" },
                            { icon: Zap, label: "Thermal", desc: "Long-Wave IR" },
                            { icon: Radio, label: "LIDAR", desc: "3D Point Cloud" },
                            { icon: Activity, label: "Seismic", desc: "Ground Vibration" },
                            { icon: Cloud, label: "Radar", desc: "mmWave Detection" },
                            { icon: Server, label: "Edge", desc: "On-Prem Compute" },
                            { icon: Lock, label: "Access", desc: "Biometric Gates" },
                            { icon: Database, label: "Storage", desc: "PB-Scale Retention" }
                        ].map((item, i) => (
                            <RevealCard key={i} delay={i * 0.05} className="group p-8 bg-black border border-white/5 rounded-2xl hover:border-green-500/30 transition-all">
                                <item.icon className="w-8 h-8 text-zinc-600 group-hover:text-green-500 transition-colors mb-4 mx-auto" />
                                <h3 className="font-bold text-lg mb-1">{item.label}</h3>
                                <p className="text-xs text-zinc-500">{item.desc}</p>
                            </RevealCard>
                        ))}
                    </div>
                </div>
            </Section>

            {/* --- SECTION 5: UI SHOWCASE --- */}
            <Section className="bg-black overflow-hidden">
                <div className="max-w-7xl mx-auto px-6 w-full text-center relative z-10">
                    <RevealCard className="mb-12">
                        <h2 className="text-4xl md:text-6xl font-black mb-6">MISSION <span className="text-zinc-600">ITSELF</span></h2>
                        <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
                            Engineered for cognitive ease. A dark-mode first interface that highlights anomalies and suppresses noise.
                        </p>
                    </RevealCard>

                    <motion.div
                        initial={{ rotateX: 20, opacity: 0, scale: 0.8 }}
                        whileInView={{ rotateX: 0, opacity: 1, scale: 1 }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="relative mx-auto max-w-5xl perspective-1000"
                    >
                        <div className="rounded-xl overflow-hidden border-8 border-zinc-800 shadow-2xl bg-zinc-900">
                            {/* Simulated UI Mockup */}
                            <div className="h-[500px] w-full bg-zinc-950 flex flex-col">
                                <div className="h-12 border-b border-white/10 flex items-center px-4 gap-4">
                                    <div className="flex gap-2">
                                        <div className="w-3 h-3 rounded-full bg-red-500" />
                                        <div className="w-3 h-3 rounded-full bg-yellow-500" />
                                        <div className="w-3 h-3 rounded-full bg-green-500" />
                                    </div>
                                    <div className="flex-1 text-center font-mono text-xs text-zinc-600">mission_control.exe</div>
                                </div>
                                <div className="flex-1 flex">
                                    <div className="w-64 border-r border-white/10 p-4 space-y-4">
                                        {[1, 2, 3, 4].map(i => <div key={i} className="h-12 bg-white/5 rounded w-full animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />)}
                                    </div>
                                    <div className="flex-1 p-4 grid grid-cols-2 gap-4">
                                        <div className="bg-white/5 rounded h-full relative overflow-hidden group">
                                            <div className="absolute inset-0 flex items-center justify-center text-zinc-700">CAMERA_01</div>
                                            <div className="absolute top-2 right-2 text-green-500 text-[10px] font-mono">LIVE</div>
                                        </div>
                                        <div className="bg-white/5 rounded h-full relative overflow-hidden group">
                                            <div className="absolute inset-0 flex items-center justify-center text-zinc-700">CAMERA_02</div>
                                            {/* Detection Box */}
                                            <div className="absolute top-1/4 left-1/4 w-1/4 h-1/4 border border-red-500 bg-red-500/10 flex items-end">
                                                <span className="bg-red-500 text-white text-[8px] px-1">INTRUDER 99%</span>
                                            </div>
                                        </div>
                                        <div className="bg-white/5 rounded h-full col-span-2 relative overflow-hidden">
                                            <div className="absolute inset-0 bg-gradient-to-t from-green-500/20 to-transparent bottom-0 h-16" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </Section>

            {/* --- SECTION 6: SCENARIOS --- */}
            <Section className="bg-zinc-950">
                <div className="max-w-7xl mx-auto px-6 w-full">
                    <RevealCard className="mb-16">
                        <h2 className="text-4xl font-black mb-2">DEPLOYMENT <span className="text-white">SCENARIOS</span></h2>
                    </RevealCard>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { title: "Border Security", desc: "Long-range thermal detection spread across hundreds of kilometers of unmanned terrain.", color: "border-red-500" },
                            { title: "Urban Defense", desc: "High-density crowd analytics and facial recognition for city centers and transit hubs.", color: "border-blue-500" },
                            { title: "Maritime Watch", desc: "Radar integration and horizon scanning for unauthorized vessel approaches.", color: "border-cyan-500" }
                        ].map((scenario, i) => (
                            <RevealCard key={i} delay={i * 0.2}>
                                <div className={`h-full p-8 bg-black border-l-4 ${scenario.color} rounded-r-2xl hover:bg-zinc-900 transition-colors`}>
                                    <div className="text-6xl font-black text-white/10 mb-6 font-serif">0{i + 1}</div>
                                    <h3 className="text-2xl font-bold mb-4">{scenario.title}</h3>
                                    <p className="text-zinc-400">{scenario.desc}</p>
                                </div>
                            </RevealCard>
                        ))}
                    </div>
                </div>
            </Section>

            {/* --- SECTION 7: DEVELOPER API --- */}
            <Section className="bg-black font-mono">
                <div className="max-w-7xl mx-auto px-6 w-full flex flex-col md:flex-row gap-16 items-center">
                    <div className="flex-1">
                        <RevealCard>
                            <span className="text-green-500 text-sm mb-4 block">{`// BUILD ON SHIELD`}</span>
                            <h2 className="text-4xl font-bold mb-6 text-white">Developers First.</h2>
                            <p className="text-zinc-400 mb-8">
                                Full programmatic access to the detection engine. Webhooks for every event. Integrate Autonomous Shield into your existing SOC in minutes.
                            </p>
                            <Button variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white">
                                Read Documentation
                            </Button>
                        </RevealCard>
                    </div>

                    <div className="flex-1 w-full">
                        <RevealCard delay={0.2}>
                            <div className="bg-zinc-900 rounded-lg p-6 border border-white/10 shadow-2xl overflow-hidden">
                                <div className="flex gap-2 mb-4">
                                    <div className="w-3 h-3 rounded-full bg-red-500" />
                                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                                    <div className="w-3 h-3 rounded-full bg-green-500" />
                                </div>
                                <pre className="text-xs md:text-sm text-green-400 overflow-x-auto p-2">
                                    <code>{`POST /api/v3/detect
{
  "source": "cam_04f_north",
  "priority": "critical",
  "objects": [
    {
      "class": "person",
      "confidence": 0.98,
      "bbox": [124, 402, 50, 100]
    }
  ]
}
// 200 OK - 12ms`}</code>
                                </pre>
                            </div>
                        </RevealCard>
                    </div>
                </div>
            </Section>

            {/* --- SECTION 8: ENTERPRISE --- */}
            <Section className="bg-zinc-950">
                <div className="max-w-7xl mx-auto px-6 w-full text-center">
                    <RevealCard className="mb-16">
                        <h2 className="text-4xl font-black mb-6">READY TO <span className="text-white">SCALE?</span></h2>
                        <p className="text-zinc-400">Flexible deployment options for organizations of any size.</p>
                    </RevealCard>

                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            { name: "Starter", price: "$499", unit: "/mo", features: ["5 Cameras", "7-Day Retention", "Email Support"] },
                            { name: "Professional", price: "$1,499", unit: "/mo", features: ["25 Cameras", "30-Day Retention", "24/7 Priority Support", "API Access"], featured: true },
                            { name: "Defense", price: "Custom", unit: "", features: ["Unlimited Sensors", "Air-Gapped Option", "Dedicated Engineer", "SLA: 99.99%"] }
                        ].map((tier, i) => (
                            <RevealCard key={i} delay={i * 0.1}>
                                <div className={`relative p-8 rounded-2xl border ${tier.featured ? 'bg-zinc-900 border-green-500' : 'bg-black border-white/10'} flex flex-col items-center h-full hover:scale-105 transition-transform duration-300`}>
                                    {tier.featured && <div className="absolute top-0 -translate-y-1/2 bg-green-500 text-black font-bold text-xs px-3 py-1 rounded-full uppercase">Most Popular</div>}
                                    <h3 className="text-xl font-bold mb-2">{tier.name}</h3>
                                    <div className="text-3xl font-black mb-1">{tier.price}<span className="text-sm font-normal text-zinc-500">{tier.unit}</span></div>

                                    <div className="w-full border-t border-white/5 my-6" />

                                    <ul className="space-y-4 mb-8 text-sm text-zinc-400 w-full">
                                        {tier.features.map((feat, j) => (
                                            <li key={j} className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                                                {feat}
                                            </li>
                                        ))}
                                    </ul>

                                    <Button className={`w-full ${tier.featured ? 'bg-green-500 hover:bg-green-400 text-black' : 'bg-white/10 hover:bg-white/20'}`}>
                                        Contact Sales
                                    </Button>
                                </div>
                            </RevealCard>
                        ))}
                    </div>
                </div>
            </Section>

            {/* --- SECTION 9: FINAL CTA --- */}
            <Section className="bg-black text-center">
                <div className="absolute inset-0 bg-green-500/5 bg-[radial-gradient(circle_at_center,_transparent_0%,_black_70%)]" />
                <div className="relative z-10 max-w-4xl mx-auto px-6">
                    <RevealCard>
                        <h2 className="text-5xl md:text-8xl font-black mb-8 leading-tight">
                            SECURE THE<br /><span className="text-green-500">FUTURE.</span>
                        </h2>
                        <MagneticButton
                            onClick={() => setLocation('/system')}
                            className="bg-white text-black text-xl font-bold px-12 py-6 rounded-full hover:bg-green-500 hover:scale-105 transition-all duration-300 shadow-[0_0_50px_rgba(34,197,94,0.3)]"
                        >
                            INITIALIZE SYSTEM NOW
                        </MagneticButton>
                    </RevealCard>
                </div>
            </Section>

            {/* --- FOOTER --- */}
            <footer className="bg-black border-t border-white/10 py-24">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                        <div className="flex items-center gap-3">
                            <Shield className="w-6 h-6 text-white" />
                            <span className="font-bold tracking-tight">AUTONOMOUS<span className="font-light text-zinc-500">SHIELD</span></span>
                        </div>
                        <div className="text-zinc-500 text-sm">
                            &copy; 2026 Defense Systems Inc. // RESTRICTED ACCESS
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
