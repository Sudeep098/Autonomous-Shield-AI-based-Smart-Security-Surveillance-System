import React from 'react';
import { cn } from '@/lib/utils';

interface GlitchTextProps {
    text: string;
    className?: string;
    intensity?: 'low' | 'medium' | 'high';
}

export function GlitchText({ text, className, intensity = 'medium' }: GlitchTextProps) {
    // Map intensity to animation duration/delay variants if needed
    // For now, using the global .glitch class

    return (
        <div className={cn("relative inline-block group", className)}>
            <span
                className={cn(
                    "relative z-10",
                    intensity !== 'low' && "group-hover:animate-pulse" // Subtle pulse on hover
                )}
            >
                {text}
            </span>
            <span
                className={cn(
                    "absolute top-0 left-0 -z-10 w-full h-full text-green-500 opacity-0 group-hover:opacity-70 transition-opacity duration-100",
                    // "Double vision" effect
                    "translate-x-[2px] translate-y-[2px]"
                )}
                aria-hidden="true"
            >
                {text}
            </span>
            <span
                className={cn(
                    "absolute top-0 left-0 -z-10 w-full h-full text-red-500 opacity-0 group-hover:opacity-70 transition-opacity duration-100",
                    "-translate-x-[2px] -translate-y-[2px]"
                )}
                aria-hidden="true"
            >
                {text}
            </span>

            {/* CSS-based Glitch overlay using data-text */}
            <div
                className={cn("absolute inset-0 glitch opacity-0 group-hover:opacity-100 pointer-events-none")}
                data-text={text}
            />
        </div>
    );
}
