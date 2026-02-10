import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Activity, Signal, Wifi, HardDrive, Cpu } from 'lucide-react';
import { cn } from '@/lib/utils';

export function SystemPulse() {
    const devices = [
        { id: 'CAM-001', type: 'Camera', signal: 95, status: 'online' },
        { id: 'CAM-002', type: 'Camera', signal: 87, status: 'online' },
        { id: 'CAM-003', type: 'Camera', signal: 72, status: 'online' },
        { id: 'AQR-001', type: 'Drone', signal: 91, status: 'online' },
        { id: 'AQR-002', type: 'Drone', signal: 68, status: 'online' },
        { id: 'SENS-001', type: 'Sensor', signal: 45, status: 'degraded' },
    ];

    const networkLoad = Array.from({ length: 20 }, () => Math.random() * 100);

    return (
        <Card className="bg-black/40 border-white/10 backdrop-blur-md overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none" />

            <div className="p-4 relative space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-green-500" />
                        <h3 className="text-xs font-black tracking-wider uppercase text-white">
                            SYSTEM PULSE
                        </h3>
                    </div>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30 font-mono text-[10px]">
                        NOMINAL
                    </Badge>
                </div>

                {/* Network Graph */}
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] text-zinc-500 font-mono">NETWORK_LOAD</span>
                        <span className="text-[10px] text-green-500 font-mono font-bold">STABLE</span>
                    </div>
                    <div className="h-16 flex items-end gap-[2px]">
                        {networkLoad.map((value, i) => (
                            <motion.div
                                key={i}
                                initial={{ height: 0 }}
                                animate={{ height: `${value}%` }}
                                transition={{
                                    duration: 0.5,
                                    delay: i * 0.02,
                                    repeat: Infinity,
                                    repeatType: 'reverse',
                                    repeatDelay: Math.random() * 3,
                                }}
                                className={cn(
                                    'flex-1 rounded-t-[1px]',
                                    value > 80 ? 'bg-red-500/50' : value > 50 ? 'bg-amber-500/50' : 'bg-green-500/50'
                                )}
                            />
                        ))}
                    </div>
                </div>

                {/* Device Health */}
                <div className="space-y-2 pt-2 border-t border-white/5">
                    <div className="text-[10px] text-zinc-500 font-mono mb-2">DEVICE_HEALTH</div>
                    {devices.map((device, index) => (
                        <motion.div
                            key={device.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-center justify-between p-2 bg-zinc-900/30 border border-white/5 rounded"
                        >
                            <div className="flex items-center gap-2 flex-1">
                                <div className={cn(
                                    'w-1.5 h-1.5 rounded-full',
                                    device.status === 'online' ? 'bg-green-500' : 'bg-amber-500'
                                )} />
                                <span className="text-[11px] font-mono text-zinc-400">{device.id}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Signal className={cn(
                                    'w-3 h-3',
                                    device.signal > 80 ? 'text-green-500' : device.signal > 50 ? 'text-amber-500' : 'text-red-500'
                                )} />
                                <span className={cn(
                                    'text-[10px] font-mono font-bold',
                                    device.signal > 80 ? 'text-green-500' : device.signal > 50 ? 'text-amber-500' : 'text-red-500'
                                )}>
                                    {device.signal}%
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* System Resources */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5">
                    <div className="flex items-center gap-2 p-2 bg-zinc-900/30 border border-white/5 rounded">
                        <Cpu className="w-3 h-3 text-blue-400" />
                        <div>
                            <div className="text-[9px] text-zinc-500 font-mono">CPU</div>
                            <div className="text-xs font-bold text-blue-400 font-mono">47%</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-zinc-900/30 border border-white/5 rounded">
                        <HardDrive className="w-3 h-3 text-purple-400" />
                        <div>
                            <div className="text-[9px] text-zinc-500 font-mono">MEMORY</div>
                            <div className="text-xs font-bold text-purple-400 font-mono">62%</div>
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
}
