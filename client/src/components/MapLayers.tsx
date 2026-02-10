import { motion } from "framer-motion";

export function WeatherLayer({ active }: { active: boolean }) {
    if (!active) return null;

    return (
        <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden select-none">
            {/* CSS-Only Rain Effect */}
            <div className="absolute inset-0 mix-blend-screen opacity-30"
                style={{
                    backgroundImage: `linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,0.5))`,
                    backgroundSize: '2px 30px',
                    animation: 'rain 0.3s linear infinite'
                }}
            />

            <style>{`
                @keyframes rain {
                    0% { background-position: 0% 0%; }
                    100% { background-position: 20px 100%; }
                }
            `}</style>

            {/* Cloud/Fog Overlay */}
            <div className="absolute inset-0 bg-white/5 mix-blend-overlay animate-pulse" />

            {/* Lightning Flash */}
            <motion.div
                animate={{ opacity: [0, 0, 0.3, 0, 0, 0.1, 0] }}
                transition={{ repeat: Infinity, duration: 5, bg: "white" }}
                className="absolute inset-0 bg-white pointer-events-none mix-blend-overlay"
            />
        </div>
    );
}

export function HeatmapLayer({ active }: { active: boolean }) {
    if (!active) return null;

    // Simulated Heatmap Gradients
    return (
        <div className="absolute inset-0 pointer-events-none z-10 opacity-40 mix-blend-screen">
            <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-red-500 rounded-full blur-[100px]" />
            <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-orange-500 rounded-full blur-[80px]" />
            <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-yellow-500 rounded-full blur-[60px]" />
        </div>
    );
}

export function ZoneLayer({ active }: { active: boolean }) {
    if (!active) return null;

    return (
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
            <defs>
                <pattern id="stripe-pattern" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                    <rect width="2" height="10" transform="translate(0,0)" fill="rgba(239, 68, 68, 0.3)" />
                </pattern>
            </defs>

            {/* Restricted Zone A - Shifted to Center */}
            <g transform="translate(2000, 2000)">
                <path d="M 200 200 L 400 150 L 500 300 L 300 400 Z"
                    fill="url(#stripe-pattern)"
                    stroke="rgba(239, 68, 68, 0.8)"
                    strokeWidth="2"
                    className="animate-pulse"
                />

                {/* Label */}
                <text x="300" y="280" fill="rgba(239, 68, 68, 0.9)" fontSize="10" fontFamily="monospace" letterSpacing="2">RESTRICTED_SECTOR_01</text>
            </g>
        </svg>
    );
}

export function IndianBorderLayer({ active }: { active: boolean }) {
    if (!active) return null;

    // "Real" High-Fidelity SVG Path for India
    // Coordinates are approximated but follow the complex contour more closely
    const indiaPath = "M 320 80 L 340 70 L 360 85 L 370 60 L 390 65 L 420 80 L 410 100 L 430 110 L 450 115 L 440 130 L 460 140 L 490 140 L 510 130 L 530 135 L 535 150 L 520 160 L 540 170 L 560 165 L 580 160 L 590 180 L 580 200 L 560 190 L 550 200 L 540 220 L 520 220 L 510 240 L 490 230 L 480 250 L 470 280 L 450 320 L 420 380 L 400 450 L 380 500 L 360 520 L 340 500 L 320 460 L 300 400 L 280 350 L 260 320 L 250 290 L 230 280 L 210 250 L 220 230 L 240 240 L 250 220 L 270 210 L 280 190 L 300 180 L 310 150 L 300 130 L 310 110 Z";

    // Since users want "Real", we try to be as detailed as possible with a manual polyline construction that covers key geographic features
    const detailedIndiaPath = `
        M 380 100 
        L 395 110 L 410 105 L 425 115 L 440 140
        L 460 150 L 500 160
        L 510 155 L 520 160
        L 530 160 L 545 155
        L 560 145 L 580 140 L 600 150 L 590 170 L 575 180
        L 560 185 L 550 200 L 540 190
        L 520 200 L 510 220
        L 500 240 L 480 270 L 460 320
        L 450 380 L 440 450 L 430 500
        L 410 520
        L 390 500 L 380 450 L 370 400
        L 360 350 L 350 300
        L 340 280 L 320 290 L 300 280 L 280 270
        L 270 250 L 290 230 L 310 210
        L 320 180 L 330 150
        L 350 130 L 360 110
        Z
    `;

    return (
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-15 overflow-visible">
            {/* Shifted to center of 5000x5000 grid (approx 2100 offset) */}
            <g transform="translate(2100, 2100) scale(1.5)">
                {/* Main Country Shape */}
                <path
                    d={detailedIndiaPath}
                    fill="rgba(34, 197, 94, 0.05)"
                    stroke="#22c55e"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="drop-shadow-[0_0_10px_rgba(34,197,94,0.3)]"
                />

                {/* Inner Scan Grid for the Country */}
                <defs>
                    <clipPath id="india-clip">
                        <path d={detailedIndiaPath} />
                    </clipPath>
                    <linearGradient id="scan-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="rgba(34, 197, 94, 0)" />
                        <stop offset="50%" stopColor="rgba(34, 197, 94, 0.2)" />
                        <stop offset="100%" stopColor="rgba(34, 197, 94, 0)" />
                    </linearGradient>
                </defs>

                <g clipPath="url(#india-clip)">
                    {/* Geographic Grid Lines */}
                    <path d="M 0 0 L 800 800 M 800 0 L 0 800" stroke="rgba(34, 197, 94, 0.1)" strokeWidth="1" />
                    {Array.from({ length: 30 }).map((_, i) => (
                        <line key={`h-${i}`} x1="0" y1={i * 30} x2="800" y2={i * 30} stroke="rgba(34, 197, 94, 0.1)" />
                    ))}
                    {Array.from({ length: 30 }).map((_, i) => (
                        <line key={`v-${i}`} x1={i * 30} y1="0" x2={i * 30} y2="800" stroke="rgba(34, 197, 94, 0.1)" />
                    ))}

                    {/* Scanning Beam Effect */}
                    <rect x="0" y="0" width="800" height="800" fill="url(#scan-gradient)" className="animate-[scan_4s_linear_infinite]" style={{ transformOrigin: 'top' }} />
                </g>

                {/* Major Nodes / Cities */}
                {[
                    { x: 395, y: 195, l: "DEL" }, // Delhi approx
                    { x: 330, y: 320, l: "MUM" }, // Mumbai approx
                    { x: 400, y: 420, l: "BLR" }, // Bangalore approx
                    { x: 480, y: 230, l: "KOL" }, // Kolkata approx
                ].map((city, i) => (
                    <g key={i}>
                        <circle cx={city.x} cy={city.y} r="2" fill="#22c55e" />
                        <text x={city.x + 4} y={city.y + 2} fill="#22c55e" fontSize="6" fontFamily="monospace" opacity="0.7">{city.l}</text>
                    </g>
                ))}
            </g>
        </svg>
    );
}

export function SatelliteLayer({ active }: { active: boolean }) {
    if (!active) return null;

    return (
        <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden select-none opacity-50">
            {/* Satellite 1 */}
            <motion.div
                initial={{ x: -50, y: 100 }}
                animate={{ x: "120vw", y: 300 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute flex items-center gap-2"
            >
                <div className="w-2 h-2 bg-blue-400 rounded-full shadow-[0_0_10px_#60a5fa]" />
                <span className="text-[8px] font-mono text-blue-400 bg-black/50 px-1">SAT_LEO_01 [LINK_ACTIVE]</span>
            </motion.div>

            {/* Satellite 2 */}
            <motion.div
                initial={{ x: "120vw", y: 400 }}
                animate={{ x: -50, y: 150 }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear", delay: 2 }}
                className="absolute flex items-center gap-2"
            >
                <div className="w-2 h-2 bg-green-400 rounded-full shadow-[0_0_10px_#4ade80]" />
                <span className="text-[8px] font-mono text-green-400 bg-black/50 px-1">SAT_GEO_09 [STABLE]</span>
            </motion.div>

            {/* Grid Overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.1)_1px,transparent_1px)] bg-[size:100px_100px]" />
        </div>
    );
}
