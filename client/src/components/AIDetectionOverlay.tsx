import { cn } from '@/lib/utils';
import { AlertTriangle } from 'lucide-react';

interface Detection {
    id: string;
    class: string;
    confidence: number;
    bbox: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    bbox_normalized?: number[];
    threat_level: 'normal' | 'suspicious' | 'critical';
    timestamp: string;
}

interface AIDetectionOverlayProps {
    detections: Detection[];
    isConnected?: boolean;
}

export function AIDetectionOverlay({ detections, isConnected = true }: AIDetectionOverlayProps) {
    const getThreatColor = (level: string) => {
        switch (level) {
            case 'critical':
                return { border: 'border-red-500', bg: 'bg-red-500', text: 'text-white' };
            case 'suspicious':
                return { border: 'border-yellow-500', bg: 'bg-yellow-500', text: 'text-black' };
            default:
                return { border: 'border-green-500', bg: 'bg-green-500', text: 'text-white' };
        }
    };

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {/* Detection Boxes */}
            {detections.map((detection, index) => {
                const colors = getThreatColor(detection.threat_level);

                // Use normalized bbox for positioning (percentage-based)
                const style = detection.bbox_normalized ? {
                    left: `${detection.bbox_normalized[0] * 100}%`,
                    top: `${detection.bbox_normalized[1] * 100}%`,
                    width: `${detection.bbox_normalized[2] * 100}%`,
                    height: `${detection.bbox_normalized[3] * 100}%`,
                } : {
                    // Fallback to pixel-based (assuming 1280x720 resolution)
                    left: `${(detection.bbox.x / 1280) * 100}%`,
                    top: `${(detection.bbox.y / 720) * 100}%`,
                    width: `${(detection.bbox.width / 1280) * 100}%`,
                    height: `${(detection.bbox.height / 720) * 100}%`,
                };

                return (
                    <div
                        key={detection.id || `det-${index}`}
                        className={cn(
                            'absolute border-2',
                            colors.border
                        )}
                        style={style}
                    >
                        {/* Label above the box */}
                        <div
                            className={cn(
                                'absolute -top-6 left-0 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap',
                                colors.bg,
                                colors.text
                            )}
                        >
                            {detection.class} {detection.class === 'person' && detection.id ? `#${detection.id.split('_').pop()} ` : ''} {Math.round(detection.confidence * 100)}%
                        </div>

                        {/* Threat indicator for critical */}
                        {detection.threat_level === 'critical' && (
                            <div className="absolute -top-2 -right-2 animate-pulse">
                                <AlertTriangle className="w-4 h-4 text-red-500 fill-red-500/50" />
                            </div>
                        )}

                        {/* Corner markers */}
                        <div className={cn('absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2', colors.border)} />
                        <div className={cn('absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2', colors.border)} />
                        <div className={cn('absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2', colors.border)} />
                        <div className={cn('absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2', colors.border)} />
                    </div>
                );
            })}

            {/* Detection Count Badge */}
            {detections.length > 0 && (
                <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-sm border border-cyan-500/50 rounded px-2 py-1">
                    <span className="text-[10px] font-mono text-cyan-400">
                        {detections.length} DETECTION{detections.length !== 1 ? 'S' : ''}
                    </span>
                </div>
            )}
        </div>
    );
}
