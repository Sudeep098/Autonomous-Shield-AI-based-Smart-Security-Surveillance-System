import { DroneTelemetry } from '@/../../shared/types/drone';
import { DroneCard } from './DroneCard';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Plane, PlaneLanding, AlertTriangle } from 'lucide-react';

interface DroneFleetManagerProps {
    drones: DroneTelemetry[];
    fleetStatus: {
        totalDrones: number;
        activeDrones: number;
        onPatrol: number;
        tracking: number;
        charging: number;
        offline: number;
    };
    onDroneClick?: (drone: DroneTelemetry) => void;
}

export function DroneFleetManager({ drones, fleetStatus, onDroneClick }: DroneFleetManagerProps) {
    return (
        <div className="space-y-4">
            {/* Fleet Overview */}
            <Card className="bg-black/40 border-white/10 backdrop-blur-md overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none" />

                <div className="p-4 relative">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Plane className="w-5 h-5 text-cyan-500" />
                            <h2 className="text-sm font-black tracking-[0.2em] uppercase text-white">
                                DRONE FLEET STATUS
                            </h2>
                        </div>
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30 font-mono text-xs">
                            {fleetStatus.activeDrones}/{fleetStatus.totalDrones} ACTIVE
                        </Badge>
                    </div>

                    {/* Status Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-cyan-500/10 border border-cyan-500/20 rounded p-3"
                        >
                            <p className="text-[10px] text-cyan-500 font-mono mb-1">ON PATROL</p>
                            <p className="text-2xl font-bold text-cyan-400 font-mono">{fleetStatus.onPatrol}</p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-red-500/10 border border-red-500/20 rounded p-3"
                        >
                            <p className="text-[10px] text-red-500 font-mono mb-1">TRACKING</p>
                            <p className="text-2xl font-bold text-red-400 font-mono">{fleetStatus.tracking}</p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-amber-500/10 border border-amber-500/20 rounded p-3"
                        >
                            <p className="text-[10px] text-amber-500 font-mono mb-1">CHARGING</p>
                            <p className="text-2xl font-bold text-amber-400 font-mono">{fleetStatus.charging}</p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="bg-zinc-500/10 border border-zinc-500/20 rounded p-3"
                        >
                            <p className="text-[10px] text-zinc-500 font-mono mb-1">OFFLINE</p>
                            <p className="text-2xl font-bold text-zinc-400 font-mono">{fleetStatus.offline}</p>
                        </motion.div>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex gap-2 mt-4 pt-4 border-t border-white/5">
                        <Button
                            size="sm"
                            className="flex-1 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-500/30 font-mono text-xs"
                        >
                            <Plane className="w-3 h-3 mr-2" />
                            DISPATCH ALL
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 border-amber-500/30 text-amber-400 hover:bg-amber-500/10 font-mono text-xs"
                        >
                            <PlaneLanding className="w-3 h-3 mr-2" />
                            RECALL ALL
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            className="border-red-500/30 text-red-400 hover:bg-red-500/10 font-mono text-xs"
                        >
                            <AlertTriangle className="w-3 h-3" />
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Drone Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {drones.map((drone, index) => (
                    <motion.div
                        key={drone.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <DroneCard drone={drone} onClick={() => onDroneClick?.(drone)} />
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
