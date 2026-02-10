import { DroneTelemetry, DroneMode, DroneStatus } from '@/../../shared/types/drone';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Battery, Signal, Gauge, Navigation, MapPin } from 'lucide-react';

interface DroneCardProps {
    drone: DroneTelemetry;
    onClick?: () => void;
    compact?: boolean;
}

export function DroneCard({ drone, onClick, compact = false }: DroneCardProps) {
    const getModeColor = (mode: DroneMode) => {
        switch (mode) {
            case DroneMode.TRACKING:
                return 'bg-red-500/20 text-red-400 border-red-500/30';
            case DroneMode.PATROL:
                return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
            case DroneMode.RETURNING:
                return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
            case DroneMode.EMERGENCY:
                return 'bg-red-600/30 text-red-300 border-red-600/50';
            default:
                return 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30';
        }
    };

    const getStatusColor = (status: DroneStatus) => {
        switch (status) {
            case DroneStatus.ACTIVE:
                return 'bg-green-500';
            case DroneStatus.CHARGING:
                return 'bg-amber-500';
            case DroneStatus.MAINTENANCE:
                return 'bg-orange-500';
            case DroneStatus.ERROR:
                return 'bg-red-500';
            default:
                return 'bg-zinc-500';
        }
    };

    const getBatteryColor = (battery: number) => {
        if (battery > 60) return 'text-green-500';
        if (battery > 30) return 'text-amber-500';
        return 'text-red-500';
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            whileHover={{ scale: 1.02 }}
            onClick={onClick}
            className={cn('cursor-pointer', compact && 'scale-95')}
        >
            <Card className="relative overflow-hidden bg-black/40 border-white/10 backdrop-blur-md hover:border-cyan-500/30 transition-all duration-300">
                {/* Glassmorphism overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none" />

                {/* Status indicator */}
                <div className="absolute top-3 right-3 flex items-center gap-2">
                    <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className={cn(
                            'w-2 h-2 rounded-full',
                            getStatusColor(drone.status),
                            drone.status === DroneStatus.ACTIVE && 'shadow-[0_0_8px]'
                        )}
                        style={{
                            boxShadow: drone.status === DroneStatus.ACTIVE ? `0 0 8px ${getStatusColor(drone.status)}` : 'none',
                        }}
                    />
                </div>

                <div className="p-4 space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                        <div>
                            <h3 className="text-sm font-bold text-white tracking-wider uppercase font-mono">
                                {drone.name}
                            </h3>
                            <p className="text-[10px] text-zinc-500 font-mono">{drone.id}</p>
                        </div>
                        <Badge className={cn('text-[10px] font-mono border', getModeColor(drone.mode))}>
                            {drone.mode}
                        </Badge>
                    </div>

                    {!compact && (
                        <>
                            {/* Location */}
                            <div className="flex items-center gap-2 text-xs text-zinc-400">
                                <MapPin className="w-3 h-3 text-cyan-500" />
                                <span className="font-mono">
                                    {drone.location.lat.toFixed(4)}°, {drone.location.lng.toFixed(4)}°
                                </span>
                            </div>

                            {/* Telemetry Grid */}
                            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5">
                                {/* Battery */}
                                <div className="flex items-center gap-2">
                                    <Battery className={cn('w-4 h-4', getBatteryColor(drone.battery))} />
                                    <div>
                                        <p className="text-[10px] text-zinc-500 font-mono">BATTERY</p>
                                        <p className={cn('text-xs font-bold font-mono', getBatteryColor(drone.battery))}>
                                            {drone.battery.toFixed(0)}%
                                        </p>
                                    </div>
                                </div>

                                {/* Signal */}
                                <div className="flex items-center gap-2">
                                    <Signal className="w-4 h-4 text-blue-400" />
                                    <div>
                                        <p className="text-[10px] text-zinc-500 font-mono">SIGNAL</p>
                                        <p className="text-xs font-bold text-blue-400 font-mono">
                                            {drone.signalStrength.toFixed(0)}%
                                        </p>
                                    </div>
                                </div>

                                {/* Altitude */}
                                <div className="flex items-center gap-2">
                                    <Gauge className="w-4 h-4 text-purple-400" />
                                    <div>
                                        <p className="text-[10px] text-zinc-500 font-mono">ALTITUDE</p>
                                        <p className="text-xs font-bold text-purple-400 font-mono">
                                            {drone.location.altitude.toFixed(0)}m
                                        </p>
                                    </div>
                                </div>

                                {/* Speed */}
                                <div className="flex items-center gap-2">
                                    <Navigation className="w-4 h-4 text-amber-400" />
                                    <div>
                                        <p className="text-[10px] text-zinc-500 font-mono">SPEED</p>
                                        <p className="text-xs font-bold text-amber-400 font-mono">
                                            {drone.speed.toFixed(1)} m/s
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Last update */}
                    <div className="text-[9px] text-zinc-600 font-mono pt-1 border-t border-white/5">
                        LAST_SYNC: {new Date(drone.lastUpdate).toLocaleTimeString()}
                    </div>
                </div>

                {/* Neon glow effect on hover */}
                <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-transparent to-cyan-500/5" />
                </div>
            </Card>
        </motion.div>
    );
}
