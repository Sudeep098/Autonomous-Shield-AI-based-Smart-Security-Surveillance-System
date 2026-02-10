import { useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { AnalyticsEvent, ThreatLevel } from '@/../../shared/types/analytics';
import { cn } from '@/lib/utils';

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

interface EventRiverProps {
    events: AnalyticsEvent[];
    onEventClick: (event: AnalyticsEvent) => void;
    selectedEventId?: string;
}

export function EventRiver({ events, onEventClick, selectedEventId }: EventRiverProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    const getThreatColor = (severity: ThreatLevel) => {
        switch (severity) {
            case ThreatLevel.CRITICAL:
                return 'bg-red-500 border-red-400';
            case ThreatLevel.HIGH:
                return 'bg-amber-500 border-amber-400';
            case ThreatLevel.MEDIUM:
                return 'bg-cyan-500 border-cyan-400';
            default:
                return 'bg-green-500 border-green-400';
        }
    };

    useEffect(() => {
        if (!containerRef.current) return;

        const ctx = gsap.context(() => {
            gsap.from('.event-marker', {
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: 'top center',
                    toggleActions: 'play none none reverse',
                },
                scale: 0,
                opacity: 0,
                stagger: 0.05,
                duration: 0.3,
            });
        }, containerRef);

        return () => ctx.revert();
    }, [events]);

    return (
        <Card className="h-full bg-black/40 border-white/10 backdrop-blur-md overflow-hidden flex flex-col">
            <div className="p-3 border-b border-white/5">
                <h3 className="text-xs font-black tracking-wider uppercase text-white flex items-center gap-2">
                    <div className="w-1 h-3 bg-purple-500 rounded-full" />
                    EVENT RIVER
                    <Badge className="ml-auto bg-purple-500/20 text-purple-400 border-purple-500/30 font-mono text-[10px]">
                        {events.length} EVENTS
                    </Badge>
                </h3>
            </div>

            <div
                ref={containerRef}
                className="flex-1 overflow-x-auto overflow-y-hidden custom-scrollbar p-4"
            >
                <div className="flex items-center gap-3 h-full" style={{ minWidth: `${events.length * 80}px` }}>
                    {/* Timeline base */}
                    <div className="absolute bottom-1/2 left-0 right-0 h-[2px] bg-white/10" />

                    {events.map((event, index) => {
                        const isSelected = event.id === selectedEventId;
                        return (
                            <motion.div
                                key={event.id}
                                className="event-marker relative flex flex-col items-center cursor-pointer"
                                onClick={() => onEventClick(event)}
                                whileHover={{ scale: 1.1 }}
                                animate={isSelected ? { scale: 1.2 } : {}}
                            >
                                {/* Event marker */}
                                <div className="relative">
                                    <motion.div
                                        animate={isSelected ? { scale: [1, 1.3, 1] } : {}}
                                        transition={{ duration: 1.5, repeat: Infinity }}
                                        className={cn(
                                            'absolute inset-0 rounded-full blur-sm',
                                            getThreatColor(event.severity).replace('border-', 'bg-').replace('500', '400/30')
                                        )}
                                    />
                                    <div
                                        className={cn(
                                            'relative w-3 h-3 rounded-full border-2',
                                            getThreatColor(event.severity),
                                            isSelected && 'shadow-[0_0_15px]',
                                            'transition-all duration-300'
                                        )}
                                        style={{
                                            boxShadow: isSelected
                                                ? `0 0 15px ${event.severity === ThreatLevel.CRITICAL ? '#ef4444' : event.severity === ThreatLevel.HIGH ? '#f59e0b' : '#06b6d4'}`
                                                : 'none',
                                        }}
                                    />
                                </div>

                                {/* Event info tag */}
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: isSelected ? 1 : 0, y: isSelected ? 0 : 10 }}
                                    className="absolute top-6 bg-black/90 border border-white/20 rounded p-2 backdrop-blur-md min-w-[150px] z-10"
                                >
                                    <div className="text-[10px] text-white font-mono font-bold mb-1">
                                        {event.title}
                                    </div>
                                    <div className="text-[9px] text-zinc-400 font-mono">
                                        {event.timestamp.toLocaleTimeString()}
                                    </div>
                                </motion.div>

                                {/* Time label below */}
                                <div className="mt-2 text-[9px] text-zinc-600 font-mono text-center whitespace-nowrap">
                                    {event.timestamp.toLocaleTimeString('en-US', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </Card>
    );
}
