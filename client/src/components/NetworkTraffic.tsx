import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity } from "lucide-react";
import { cn } from "@/lib/utils";

// Mock data generator for graph
const generateData = () => {
    return Array.from({ length: 20 }).map((_, i) => ({
        time: i,
        inbound: Math.floor(Math.random() * 50) + 20,
        outbound: Math.floor(Math.random() * 30) + 10,
    }));
};

const data = generateData();

export function NetworkTraffic({ className }: { className?: string }) {
    return (
        <div className={cn("flex flex-col h-full bg-black/40 backdrop-blur border border-white/10 rounded-sm p-4", className)}>
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-blue-500" />
                    <h3 className="text-xs font-bold font-mono uppercase text-white tracking-wider">Network Traffic</h3>
                </div>
                <div className="flex gap-4 text-[10px] font-mono">
                    <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        <span className="text-zinc-400">IN</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                        <span className="text-zinc-400">OUT</span>
                    </div>
                </div>
            </div>

            <div className="flex-1 w-full min-h-[120px]">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <XAxis hide />
                        <YAxis hide domain={[0, 100]} />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#000', borderColor: '#333', fontSize: '12px' }}
                            itemStyle={{ color: '#ccc' }}
                            labelStyle={{ display: 'none' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="inbound"
                            stroke="#3b82f6"
                            fillOpacity={1}
                            fill="url(#colorIn)"
                            strokeWidth={2}
                            animationDuration={2000}
                        />
                        <Area
                            type="monotone"
                            dataKey="outbound"
                            stroke="#06b6d4"
                            fillOpacity={1}
                            fill="url(#colorOut)"
                            strokeWidth={2}
                            animationDuration={2500}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-white/5">
                <div>
                    <div className="text-[10px] text-zinc-500 uppercase">Speed In</div>
                    <div className="text-sm font-mono font-bold text-white">24.5 <span className="text-[10px] text-zinc-600">Mb/s</span></div>
                </div>
                <div className="text-right">
                    <div className="text-[10px] text-zinc-500 uppercase">Speed Out</div>
                    <div className="text-sm font-mono font-bold text-white">12.1 <span className="text-[10px] text-zinc-600">Mb/s</span></div>
                </div>
            </div>
        </div>
    );
}
