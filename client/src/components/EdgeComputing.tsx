import { Server, Database, Wifi, Cpu, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

export function EdgeComputing() {
    return (
        <div className="bg-black/40 border border-white/10 rounded-xl p-4 backdrop-blur-md">
            <div className="flex items-center gap-2 mb-4">
                <Server className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-black text-white uppercase tracking-wider">
                    Edge Compute Nodes
                </h3>
            </div>

            <div className="space-y-3">
                {/* Node 1 */}
                <div className="bg-white/5 rounded p-2 text-[10px] font-mono">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-zinc-400">NODE_01 (JETSON)</span>
                        <span className="text-green-400">ONLINE</span>
                    </div>
                    <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-cyan-500"
                            initial={{ width: '40%' }}
                            animate={{ width: ['40%', '65%', '45%'] }}
                            transition={{ duration: 3, repeat: Infinity }}
                        />
                    </div>
                    <div className="flex justify-between mt-1 text-zinc-600">
                        <span>CPU: 45%</span>
                        <span>TEMP: 52°C</span>
                    </div>
                </div>

                {/* Node 2 */}
                <div className="bg-white/5 rounded p-2 text-[10px] font-mono">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-zinc-400">NODE_02 (RPI-4)</span>
                        <span className="text-green-400">ONLINE</span>
                    </div>
                    <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-green-500"
                            initial={{ width: '20%' }}
                            animate={{ width: ['20%', '30%', '25%'] }}
                            transition={{ duration: 4, repeat: Infinity }}
                        />
                    </div>
                    <div className="flex justify-between mt-1 text-zinc-600">
                        <span>CPU: 28%</span>
                        <span>TEMP: 44°C</span>
                    </div>
                </div>

                {/* Sync Status */}
                <div className="flex items-center justify-between text-[10px] border-t border-white/10 pt-2 mt-2">
                    <div className="flex items-center gap-1.5">
                        <Database className="w-3 h-3 text-purple-400" />
                        <span className="text-zinc-400">SYNC_STATUS</span>
                    </div>
                    <span className="text-purple-400 font-bold">OFFLINE_READY</span>
                </div>
            </div>
        </div>
    );
}
