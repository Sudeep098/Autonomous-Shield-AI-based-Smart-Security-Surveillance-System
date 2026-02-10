import { Layout } from "@/components/Layout";
import { useDevices } from "@/hooks/use-devices";
import { HardDrive, Battery, Signal, WifiOff, Filter, Search, Camera, Plane, Activity, Server, Database, Plus, RefreshCw, X, ChevronRight, Cpu, Thermometer, Zap, CheckSquare, Square, Trash2, Power, Terminal, PieChart as PieChartIcon } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, ComposedChart, Line, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Area, AreaChart } from 'recharts';
import { cn } from "@/lib/utils";
import { PageTransition } from "@/components/ui/PageTransition";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";


// Mock data for the detailed view graph
const mockTelemetryData = Array.from({ length: 20 }, (_, i) => ({
  time: `${i}:00`,
  bandwidth: Math.floor(Math.random() * 500) + 100,
  cpu: Math.floor(Math.random() * 60) + 20,
}));

const getDeviceIcon = (type: string) => {
  switch (type) {
    case 'camera': return Camera;
    case 'drone': return Plane;
    case 'sensor': return Activity;
    case 'server': return Server;
    default: return HardDrive;
  }
};

export default function Devices() {
  const { data: devices } = useDevices();
  const [filter, setFilter] = useState<'all' | 'online' | 'offline'>('all');
  const [search, setSearch] = useState("");
  const handleSimulatedAction = (action: string) => console.log("Action:", action);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [viewDevice, setViewDevice] = useState<any>(null); // Selecting a device for detailed view

  const filteredDevices = devices?.filter(d => {
    const matchesFilter = filter === 'all' || d.status === filter;
    const matchesSearch = d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.location.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const onlineCount = devices?.filter(d => d.status === 'online').length || 0;
  const offlineCount = devices?.filter(d => d.status === 'offline').length || 0;

  const toggleSelection = (id: number) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const selectAll = () => {
    if (filteredDevices?.length === selectedIds.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredDevices?.map(d => d.id) || []);
    }
  };

  return (
    <Layout>
      <PageTransition className="space-y-8 relative">
        {/* HUD Header */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-white/5 pb-10 relative">
          <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-green-500/20 via-transparent to-transparent" />

          <div>
            <div className="flex items-center gap-4 mb-2">
              <div className="relative">
                <div className="absolute inset-0 bg-green-500/20 blur-md animate-pulse" />
                <div className="relative p-2.5 bg-zinc-900 border border-white/10 rounded">
                  <Database className="h-6 w-6 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-4xl font-black text-white tracking-widest uppercase leading-none">ASSET_VAULT</h1>
                <p className="text-[10px] text-zinc-500 font-mono tracking-[0.4em] uppercase mt-2">CYBER_PHYSICAL_INVENTORY // GRID_S7</p>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-lg px-6 py-3 flex gap-10 text-xs font-mono shadow-2xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent" />
              <div className="flex flex-col items-center relative z-10">
                <span className="text-green-500 text-[9px] font-black uppercase tracking-widest mb-1">STABLE_LINKS</span>
                <span className="text-3xl font-black text-white tracking-tighter">{onlineCount}</span>
              </div>
              <div className="w-[1px] bg-white/10" />
              <div className="flex flex-col items-center relative z-10">
                <span className="text-red-500 text-[9px] font-black uppercase tracking-widest mb-1">OFFLINE_NODES</span>
                <span className="text-3xl font-black text-white tracking-tighter">{offlineCount}</span>
              </div>
            </div>
          </div>

          {/* Device Analytics Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Status Breakdown */}
            <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-xl p-4 flex flex-col relative shadow-xl h-48">
              <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white/20" />
              <div className="flex items-center gap-2 mb-2">
                <PieChartIcon className="w-4 h-4 text-cyan-500" />
                <h3 className="text-xs font-black tracking-wider uppercase text-white">FLEET_STATUS_MATRIX</h3>
              </div>
              <div className="flex-1 w-full flex items-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Online', value: onlineCount, color: '#22c55e' },
                        { name: 'Offline', value: offlineCount, color: '#ef4444' },
                        { name: 'Maintenance', value: 3, color: '#f59e0b' },
                      ]}
                      innerRadius={40}
                      outerRadius={60}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      <Cell fill="#22c55e" />
                      <Cell fill="#ef4444" />
                      <Cell fill="#f59e0b" />
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#000000dd', border: '1px solid #ffffff20', borderRadius: '4px', fontSize: '12px' }}
                      itemStyle={{ color: '#fff' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-col gap-2 ml-4">
                  <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-400">
                    <div className="w-2 h-2 bg-green-500 rounded-full" /> ONLINE ({onlineCount})
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-400">
                    <div className="w-2 h-2 bg-red-500 rounded-full" /> OFFLINE ({offlineCount})
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-400">
                    <div className="w-2 h-2 bg-amber-500 rounded-full" /> MAINT (3)
                  </div>
                </div>
              </div>
            </div>

            {/* Resource Usage Trend */}
            <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-xl p-4 flex flex-col relative shadow-xl h-48">
              <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white/20" />
              <div className="flex items-center gap-2 mb-2">
                <Cpu className="w-4 h-4 text-cyan-500" />
                <h3 className="text-xs font-black tracking-wider uppercase text-white">RESOURCE_LOAD_INDEX</h3>
              </div>
              <div className="flex-1 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={mockTelemetryData}>
                    <defs>
                      <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                    <XAxis dataKey="time" stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip
                      cursor={{ fill: '#ffffff10' }}
                      contentStyle={{ backgroundColor: '#000000dd', border: '1px solid #ffffff20', borderRadius: '4px', fontSize: '12px' }}
                    />
                    <Area type="monotone" dataKey="bandwidth" stroke="#22c55e" fillOpacity={0.1} fill="#22c55e" />
                    <Line type="monotone" dataKey="cpu" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-4 w-full justify-between items-center z-20 relative">
          <div className="relative group w-full sm:w-auto flex items-center gap-4">
            <button
              onClick={selectAll}
              className="p-3 bg-black/80 border border-white/10 rounded-lg text-zinc-500 hover:text-white hover:border-green-500/30 transition-all"
              title="Select All"
            >
              {filteredDevices?.length === selectedIds.length && filteredDevices?.length > 0 ? (
                <CheckSquare className="h-4 w-4 text-green-500" />
              ) : (
                <Square className="h-4 w-4" />
              )}
            </button>

            <div className="relative group flex-1 sm:w-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600 group-focus-within:text-green-500 transition-colors" />
              <input
                type="text"
                placeholder="QUERY_ASSET_DATABASE..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-black/80 border border-white/10 rounded-lg px-12 py-3 text-[11px] text-white focus:outline-none focus:border-green-500/30 transition-all w-full sm:w-80 font-mono uppercase placeholder:text-zinc-700 shadow-xl"
              />
            </div>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <div className="bg-black/80 backdrop-blur-xl border border-white/10 rounded-lg p-1.5 flex shadow-xl">
              {['all', 'online', 'offline'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f as any)}
                  className={cn(
                    "px-4 py-1.5 text-[9px] font-black uppercase rounded transition-all font-mono tracking-widest",
                    filter === f ? "bg-white/10 text-white shadow-inner" : "text-zinc-500 hover:text-zinc-300"
                  )}
                >
                  {f === 'all' ? 'SYST_ALL' : f === 'online' ? 'LNK_UP' : 'LNK_DWN'}
                </button>
              ))}
            </div>
            <button
              onClick={() => handleSimulatedAction("SCAN_NEW_ASSETS")}
              className="p-3 border border-white/10 rounded-lg hover:bg-green-500/10 bg-black/80 text-green-500 transition-all hover:border-green-500/30 shadow-xl"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Device Grid */}
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20"
        >
          <AnimatePresence mode="popLayout">
            {filteredDevices?.map((device) => (
              <motion.div
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                key={device.id}
                onClick={() => setViewDevice(device)}
                className={cn(
                  "bg-black/40 backdrop-blur-xl border rounded-xl p-0 group cursor-pointer transition-all relative overflow-hidden shadow-xl",
                  selectedIds.includes(device.id) ? "border-green-500/50 shadow-[0_0_20px_rgba(34,197,94,0.1)]" : "border-white/10 hover:border-green-500/30"
                )}
              >
                {/* HUD Shimmer */}
                <div className="absolute inset-x-0 h-40 bg-gradient-to-b from-white/[0.02] to-transparent -translate-y-full group-hover:animate-[shimmer_3s_infinite] pointer-events-none" />

                {/* HUD Corner Accents */}
                <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white/20 group-hover:border-green-500/30 transition-colors" />
                <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-white/20 group-hover:border-green-500/30 transition-colors" />

                {/* Top Status Bar */}
                <div className={cn("h-1.5 w-full transition-colors duration-500",
                  device.status === 'online' ? "bg-green-500/40" : "bg-red-500/40"
                )} />

                <div className="p-5">
                  {/* Selection Checkbox */}
                  <div className="absolute top-4 right-4 z-10" onClick={(e) => { e.stopPropagation(); toggleSelection(device.id); }}>
                    <div className={cn("w-5 h-5 rounded border flex items-center justify-center transition-all",
                      selectedIds.includes(device.id) ? "bg-green-500 border-green-500" : "bg-black/40 border-white/20 hover:border-white/50"
                    )}>
                      {selectedIds.includes(device.id) && <CheckSquare className="h-3.5 w-3.5 text-black" />}
                    </div>
                  </div>

                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                      <div className={cn("p-2.5 rounded-lg bg-zinc-900 border transition-all duration-300",
                        device.status === 'online' ? "text-green-500 border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.1)]" : "text-zinc-600 border-white/5"
                      )}>
                        {(() => {
                          const Icon = getDeviceIcon(device.type);
                          return <Icon className="h-5 w-5" />;
                        })()}
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-white tracking-widest uppercase group-hover:text-green-400 transition-colors leading-tight">{device.name}</h3>
                        <p className="text-[9px] text-zinc-500 font-mono tracking-widest mt-1">NODE_FIX_{device.id.toString().padStart(4, '0')}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-[9px] font-mono font-black mb-6">
                    <div className="bg-white/5 px-2.5 py-2 rounded-md flex flex-col gap-0.5 border border-white/5">
                      <span className="text-zinc-600 uppercase tracking-widest">UNIT_CLASS</span>
                      <span className="text-white uppercase truncate">{device.type}</span>
                    </div>
                    <div className="bg-white/5 px-2.5 py-2 rounded-md flex flex-col gap-0.5 border border-white/5">
                      <span className="text-zinc-600 uppercase tracking-widest">SECTOR_LOC</span>
                      <span className="text-white uppercase truncate">{device.location}</span>
                    </div>
                    <div className="bg-white/5 px-2.5 py-2 rounded-md flex flex-col gap-0.5 col-span-2 border border-white/5">
                      <span className="text-zinc-600 uppercase tracking-widest">NETWORK_ADDR</span>
                      <span className="text-blue-400">{device.ipAddress || '0.0.0.0'}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-white/5 relative">
                    <div className="absolute top-0 left-0 w-8 h-[1px] bg-green-500/30" />

                    <div className="flex items-center gap-3">
                      <Battery className={cn("h-3.5 w-3.5", device.battery && device.battery < 20 ? "text-red-500" : "text-zinc-500")} />
                      <span className={cn("text-[10px] font-black font-mono", device.battery && device.battery < 20 ? "text-red-500" : "text-white")}>
                        {device.battery ? `${device.battery}%` : 'EXT_PWR'}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <Signal className={cn("h-3.5 w-3.5", device.status === 'online' ? "text-green-500" : "text-zinc-700")} />
                      <span className="text-[10px] font-black font-mono text-zinc-500 uppercase tracking-tighter">
                        {device.status === 'online' ? 'UPLINK_OK' : 'LINK_LOST'}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Floating Bulk Actions Bar */}
        <AnimatePresence>
          {selectedIds.length > 0 && (
            <motion.div
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl p-2 px-6 shadow-2xl flex items-center gap-6"
            >
              <span className="text-[10px] font-black text-white uppercase tracking-widest border-r border-white/10 pr-6">
                {selectedIds.length} UNITS SELECTED
              </span>
              <div className="flex gap-2">
                <button className="p-2.5 rounded-lg bg-green-500/10 text-green-500 hover:bg-green-500/20 border border-transparent hover:border-green-500/30 transition-all flex items-center gap-2 group">
                  <Power className="h-4 w-4" />
                  <span className="text-[9px] font-black uppercase tracking-widest w-0 overflow-hidden group-hover:w-auto transition-all">Enable</span>
                </button>
                <button className="p-2.5 rounded-lg bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white border border-transparent transition-all flex items-center gap-2 group">
                  <RefreshCw className="h-4 w-4" />
                  <span className="text-[9px] font-black uppercase tracking-widest w-0 overflow-hidden group-hover:w-auto transition-all">Restart</span>
                </button>
                <button className="p-2.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-transparent hover:border-red-500/30 transition-all flex items-center gap-2 group">
                  <Trash2 className="h-4 w-4" />
                  <span className="text-[9px] font-black uppercase tracking-widest w-0 overflow-hidden group-hover:w-auto transition-all">Purge</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Device Command Center (Detail Modal) */}
        <AnimatePresence>
          {viewDevice && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setViewDevice(null)}
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              />
              <motion.div
                layoutId={`device-${viewDevice.id}`}
                className="bg-black/90 border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden relative z-10 shadow-2xl flex flex-col"
              >
                {/* Modal Header */}
                <div className="p-6 border-b border-white/5 flex justify-between items-start bg-zinc-900/50">
                  <div className="flex items-center gap-6">
                    <div className={cn("p-4 rounded-xl border",
                      viewDevice.status === 'online' ? "bg-green-500/10 border-green-500/20 text-green-500" : "bg-red-500/10 border-red-500/20 text-red-500"
                    )}>
                      {(() => {
                        const Icon = getDeviceIcon(viewDevice.type);
                        return <Icon className="h-8 w-8" />;
                      })()}
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h2 className="text-2xl font-black text-white uppercase tracking-widest">{viewDevice.name}</h2>
                        <span className={cn("px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border",
                          viewDevice.status === 'online' ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"
                        )}>{viewDevice.status}</span>
                      </div>
                      <p className="text-xs font-mono text-zinc-500 uppercase tracking-[0.2em]">{viewDevice.type} // {viewDevice.location} // {viewDevice.ipAddress}</p>
                    </div>
                  </div>
                  <button onClick={() => setViewDevice(null)} className="p-2 hover:bg-white/10 rounded-lg text-zinc-500 hover:text-white transition-all">
                    <X className="h-6 w-6" />
                  </button>
                </div>

                {/* Modal Content */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                  <div className="grid grid-cols-3 gap-8 mb-8">
                    <div className="col-span-2 space-y-8">
                      {/* Live Telemetry Graph */}
                      <div className="bg-black/40 border border-white/5 rounded-xl p-6">
                        <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                          <Activity className="h-4 w-4 text-blue-400" />
                          Live Bandwidth Telemetry
                        </h3>
                        <div className="h-64 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={mockTelemetryData}>
                              <defs>
                                <linearGradient id="colorBandwidth" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                              </defs>
                              <XAxis dataKey="time" stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
                              <YAxis stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
                              <Tooltip
                                contentStyle={{ backgroundColor: '#000', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                                itemStyle={{ color: '#fff', fontSize: '10px' }}
                              />
                              <Area type="monotone" dataKey="bandwidth" stroke="#3b82f6" fillOpacity={1} fill="url(#colorBandwidth)" />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {/* System Logs */}
                      <div className="bg-black/40 border border-white/5 rounded-xl overflow-hidden">
                        <div className="p-4 border-b border-white/5 bg-white/[0.02]">
                          <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] flex items-center gap-2">
                            <Terminal className="h-4 w-4 text-zinc-400" />
                            Maintenance_Log
                          </h3>
                        </div>
                        <div className="p-4 space-y-2 font-mono text-[10px]">
                          <div className="flex gap-4 text-zinc-500">
                            <span>14:02:22</span>
                            <span className="text-green-500">SYS_OK</span>
                            <span>Routine health check passed.</span>
                          </div>
                          <div className="flex gap-4 text-zinc-500">
                            <span>13:45:10</span>
                            <span className="text-blue-400">NET_INC</span>
                            <span>Packet surge detected (45MB).</span>
                          </div>
                          <div className="flex gap-4 text-zinc-500">
                            <span>12:00:00</span>
                            <span className="text-zinc-400">SYS_BOOT</span>
                            <span>System cold start initiated.</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Sidebar Controls */}
                    <div className="space-y-4">
                      <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                        <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4">Device Health</h4>
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between text-[10px] uppercase font-bold text-zinc-400 mb-1">
                              <span>CPU Load</span>
                              <span>34%</span>
                            </div>
                            <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                              <div className="h-full w-[34%] bg-green-500" />
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-[10px] uppercase font-bold text-zinc-400 mb-1">
                              <span>Memory</span>
                              <span>62%</span>
                            </div>
                            <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                              <div className="h-full w-[62%] bg-yellow-500" />
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-[10px] uppercase font-bold text-zinc-400 mb-1">
                              <span>Temperature</span>
                              <span>45°C</span>
                            </div>
                            <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                              <div className="h-full w-[45%] bg-green-500" />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => handleSimulatedAction("REBOOT_SYSTEM_ROOT")}
                          className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-black text-white uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                        >
                          <RefreshCw className="h-3 w-3" /> Reboot_System
                        </button>
                        <button
                          onClick={() => handleSimulatedAction("ICMP_PING_SEQUENCE")}
                          className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-black text-white uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                        >
                          <Zap className="h-3 w-3" /> Ping_Test
                        </button>
                        <button
                          onClick={() => handleSimulatedAction("EMERGENCY_HALT")}
                          className="w-full py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl text-[10px] font-black text-red-500 uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                        >
                          <Power className="h-3 w-3" /> Emergency_Stop
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </PageTransition>
    </Layout>
  );
}

