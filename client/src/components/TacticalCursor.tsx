import React, { useEffect, useState } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';

export function TacticalCursor() {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [clicked, setClicked] = useState(false);
    const [hovered, setHovered] = useState(false);

    // Smooth springs for cursor movement
    const cursorX = useSpring(0, { stiffness: 500, damping: 28 });
    const cursorY = useSpring(0, { stiffness: 500, damping: 28 });

    useEffect(() => {
        const moveCursor = (e: MouseEvent) => {
            setPosition({ x: e.clientX, y: e.clientY });
            cursorX.set(e.clientX);
            cursorY.set(e.clientY);

            // Check if hovering interactive element
            const target = e.target as HTMLElement;
            const isInteractive = target.closest('button, a, input, [role="button"]');
            setHovered(!!isInteractive);
        };

        const handleClick = () => {
            setClicked(true);
            setTimeout(() => setClicked(false), 150);
        };

        window.addEventListener('mousemove', moveCursor);
        window.addEventListener('mousedown', handleClick); // Use mousedown for instant feedback

        // Hide default cursor
        document.body.style.cursor = 'none';

        return () => {
            window.removeEventListener('mousemove', moveCursor);
            window.removeEventListener('mousedown', handleClick);
            document.body.style.cursor = 'auto'; // Restore on unmount
        };
    }, [cursorX, cursorY]);

    return (
        <motion.div
            className="fixed top-0 left-0 pointer-events-none z-[9999] mix-blend-screen"
            style={{
                x: cursorX,
                y: cursorY,
                translateX: "-50%",
                translateY: "-50%"
            }}
        >
            {/* Main Crosshair */}
            <div className={`relative flex items-center justify-center transition-all duration-200 ${hovered ? 'scale-150' : 'scale-100'}`}>
                {/* Center Dot */}
                <div className="w-1 h-1 bg-green-500 rounded-full shadow-[0_0_4px_#22c55e]" />

                {/* Outer Ring */}
                <div className={`absolute border border-green-500/50 rounded-full transition-all duration-300 ${hovered ? 'w-12 h-12 border-dashed animate-spin-slow' : 'w-8 h-8 opacity-50'}`} />

                {/* Crosslines */}
                <div className="absolute w-full h-[1px] bg-green-500/30 w-4" />
                <div className="absolute h-full w-[1px] bg-green-500/30 h-4" />

                {/* Click Ripple */}
                {clicked && (
                    <motion.div
                        initial={{ scale: 0.5, opacity: 1 }}
                        animate={{ scale: 2, opacity: 0 }}
                        className="absolute border border-green-400 rounded-full w-8 h-8"
                    />
                )}
            </div>

            {/* Coordinate Readout */}
            <div className="absolute top-4 left-4 flex flex-col gap-0.5 pointer-events-none">
                <span className="text-[8px] font-mono font-black text-green-500/80 tracking-widest bg-black/60 px-1 rounded">
                    X:{Math.round(position.x).toString().padStart(4, '0')}
                </span>
                <span className="text-[8px] font-mono font-black text-green-500/80 tracking-widest bg-black/60 px-1 rounded">
                    Y:{Math.round(position.y).toString().padStart(4, '0')}
                </span>
            </div>

            {/* Trailing Line (horizontal/vertical guides) - Optional, maybe too noisy? Let's keep it minimal for now */}
        </motion.div>
    );
}
