import { useRef, useEffect } from 'react';

/**
 * useGPUAnimation
 * 
 * A hook to enforce GPU acceleration and efficient animation loops.
 * 
 * @param callback - The animation frame callback
 * @param isActive - Whether the animation should be running
 */
export function useGPUAnimation(
    callback: (deltaTime: number) => void,
    isActive: boolean = true
) {
    const requestRef = useRef<number>();
    const previousTimeRef = useRef<number>();

    const animate = (time: number) => {
        if (previousTimeRef.current !== undefined) {
            const deltaTime = time - previousTimeRef.current;
            callback(deltaTime);
        }
        previousTimeRef.current = time;
        requestRef.current = requestAnimationFrame(animate);
    };

    useEffect(() => {
        if (!isActive) {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
            return;
        }

        requestRef.current = requestAnimationFrame(animate);
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [isActive, callback]);
}

/**
 * Utility to generate GPU-optimized CSS styles
 */
export const gpuLayer = {
    backfaceVisibility: 'hidden',
    perspective: 1000,
    transform: 'translate3d(0,0,0)',
    willChange: 'transform, opacity'
} as const;
