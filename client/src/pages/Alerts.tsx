import { Layout } from "@/components/Layout";
import { useAlerts } from "@/hooks/use-alerts";
import { AlertTriangle, Filter, Download, Shield, Clock, MapPin, Search, AlertOctagon, CheckCircle2, Calendar, Archive, Eye, X, Crosshair, BarChart3, PieChart as PieChartIcon } from "lucide-react";
import { BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { format } from "date-fns";
import { PageTransition } from "@/components/ui/PageTransition";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Suspect {
  _id: string;
  suspectName: string;
  detectionId: string;
  confidence: number;
  threatLevel: 'critical' | 'suspicious' | 'normal';
  detectedAt: string;
  location?: {
    name?: string;
    cameraId?: string;
  };
}

export default function Alerts() {
  const { data: alerts } = useAlerts();
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState("");
  const [timeFilter, setTimeFilter] = useState<'24h' | '7d' | '30d'>('24h');
  const [viewAlert, setViewAlert] = useState<any>(null); // For map modal
  const [suspects, setSuspects] = useState<Suspect[]>([]);
  const [suspectsLoading, setSupspectsLoading] = useState(true);

  // Load suspects from MongoDB
  useEffect(() => {
    const loadSuspects = async () => {
      try {
        const response = await fetch('/api/suspects?limit=50');
        if (response.ok) {
          const data = await response.json();
          setSuspects(data);
        }
      } catch (error) {
        console.error('Failed to load suspects:', error);
      } finally {
        setSupspectsLoading(false);
      }
    };

    loadSuspects();
    // Reload suspects every 30 seconds
    const interval = setInterval(loadSuspects, 30000);
    return () => clearInterval(interval);
  }, []);

  const filteredAlerts = alerts?.filter(alert => {
    const matchesSearch = alert.title.toLowerCase().includes(search.toLowerCase()) ||
      alert.description.toLowerCase().includes(search.toLowerCase()) ||
      alert.location.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (filter === 'all') return true;
    if (filter === 'critical') return alert.severity === 'critical';
    if (filter === 'active') return alert.status === 'active';
    return alert.severity === filter;
  });

  return (
    <Layout>
      <PageTransition className="space-y-8 relative">
        {/* Header HUD */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-white/5 pb-10 relative">
          <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-red-500/20 via-transparent to-transparent" />

          <div>
            <div className="flex items-center gap-4 mb-2">
              <div className="relative">
                <div className="absolute inset-0 bg-red-500/20 blur-md animate-pulse" />
                <div className="relative p-2.5 bg-zinc-900 border border-white/10 rounded">
                  <AlertOctagon className="h-6 w-6 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-4xl font-black text-white tracking-widest uppercase leading-none">THREAT_MATIX</h1>
                <p className="text-[10px] text-zinc-500 font-mono tracking-[0.4em] uppercase mt-2">ANOMALY_DETECTION // REAL_TIME_STREAM</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="bg-black/80 backdrop-blur-xl border border-white/10 rounded-lg p-1.5 flex items-center shadow-xl">
              <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest px-3 border-r border-white/10 mr-2">Timeframe</span>
              {['24h', '7d', '30d'].map((t) => (
                <button
                  key={t}
                  onClick={() => setTimeFilter(t as any)}
                  className={cn(
                    "px-3 py-1.5 text-[9px] font-black uppercase rounded transition-all font-mono tracking-widest",
                    timeFilter === t ? "bg-white/10 text-white" : "text-zinc-600 hover:text-zinc-300"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
            <button className="px-5 py-2.5 bg-black/80 hover:bg-white/10 text-[10px] font-mono font-black uppercase text-white rounded-lg border border-white/10 transition-all shadow-xl flex items-center gap-3 group">
              <Download className="h-4 w-4 text-zinc-500 group-hover:text-white" /> EXPORT_AUDIT
            </button>
          </div>
        </div>

        {/* Analytics Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Severity Distribution */}
          <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-xl p-4 flex flex-col relative shadow-xl h-48">
            <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white/20" />
            <div className="flex items-center gap-2 mb-2">
              <PieChartIcon className="w-4 h-4 text-cyan-500" />
              <h3 className="text-xs font-black tracking-wider uppercase text-white">THREAT_DISTRIBUTION</h3>
            </div>
            <div className="flex-1 w-full flex items-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Critical', value: 35, color: '#ef4444' },
                      { name: 'Warning', value: 45, color: '#f59e0b' },
                      { name: 'Info', value: 20, color: '#06b6d4' },
                    ]}
                    innerRadius={40}
                    outerRadius={60}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    <Cell fill="#ef4444" />
                    <Cell fill="#f59e0b" />
                    <Cell fill="#06b6d4" />
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#000000dd', border: '1px solid #ffffff20', borderRadius: '4px', fontSize: '12px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-2 ml-4">
                <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-400">
                  <div className="w-2 h-2 bg-red-500 rounded-full" /> CRITICAL (35%)
                </div>
                <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-400">
                  <div className="w-2 h-2 bg-amber-500 rounded-full" /> WARNING (45%)
                </div>
                <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-400">
                  <div className="w-2 h-2 bg-cyan-500 rounded-full" /> INFO (20%)
                </div>
              </div>
            </div>
          </div>

          {/* Frequency Heatmap */}
          <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-xl p-4 flex flex-col relative shadow-xl h-48">
            <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white/20" />
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-4 h-4 text-cyan-500" />
              <h3 className="text-xs font-black tracking-wider uppercase text-white">EVENT_FREQUENCY_24H</h3>
            </div>
            <div className="flex-1 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { time: '00', count: 12 }, { time: '04', count: 8 },
                  { time: '08', count: 24 }, { time: '12', count: 45 },
                  { time: '16', count: 32 }, { time: '20', count: 18 },
                ]}>
                  <XAxis dataKey="time" stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip
                    cursor={{ fill: '#ffffff10' }}
                    contentStyle={{ backgroundColor: '#000000dd', border: '1px solid #ffffff20', borderRadius: '4px', fontSize: '12px' }}
                  />
                  <Bar dataKey="count" fill="#06b6d4" radius={[2, 2, 0, 0]} barSize={30} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-xl flex flex-col shadow-2xl relative">
          {/* HUD Accents */}
          <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/20" />
          <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/20" />

          {/* Tactical Filters & Search */}
          <div className="p-4 border-b border-white/5 flex flex-col md:flex-row gap-4 justify-between bg-white/[0.02]">
            <div className="flex gap-3 overflow-x-auto no-scrollbar">
              {['all', 'critical', 'high', 'active'].map((status) => (
                <button
                  key={status}
                  className={cn(
                    "px-5 py-2 rounded-lg text-[9px] font-black font-mono uppercase tracking-[0.2em] transition-all border",
                    filter === status
                      ? "bg-red-500/10 text-red-500 border-red-500/30 shadow-[inset_0_0_10px_rgba(239,68,68,0.1)]"
                      : "bg-transparent text-zinc-600 border-transparent hover:text-zinc-400 hover:bg-white/5"
                  )}
                  onClick={() => setFilter(status)}
                >
                  {status === 'all' ? 'SYST_ALL' : status}
                </button>
              ))}
            </div>

            <div className="relative group w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-600 group-focus-within:text-white transition-colors" />
              <input
                type="text"
                placeholder="SEARCH_LOGS..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-[10px] font-mono text-white focus:outline-none focus:border-white/30 transition-all uppercase placeholder:text-zinc-700"
              />
            </div>
          </div>

          <div className="flex-1 p-2 space-y-2">
            <AnimatePresence mode="popLayout">
              {filteredAlerts?.map((alert) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  key={alert.id}
                  className={cn(
                    "p-3 border-l-2 bg-gradient-to-r transition-all group hover:pl-4 relative overflow-hidden",
                    alert.severity === 'critical' ? "border-red-500 from-red-500/10 to-transparent" :
                      alert.severity === 'high' ? "border-orange-500 from-orange-500/10 to-transparent" :
                        "border-blue-500 from-blue-500/10 to-transparent"
                  )}
                >
                  <div className="flex items-start justify-between gap-4 relative z-10">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {alert.severity === 'critical' && <AlertTriangle className="h-3 w-3 text-red-500 animate-pulse" />}
                        <h3 className={cn("text-sm font-bold uppercase tracking-wide",
                          alert.severity === 'critical' ? "text-red-400" : "text-white"
                        )}>{alert.title}</h3>
                        <span className="text-[10px] bg-white/5 px-1.5 rounded text-zinc-500 font-mono">{alert.id.toString().padStart(4, '0')}</span>
                      </div>
                      <p className="text-xs text-zinc-400 font-mono mb-2 pl-5 line-clamp-1">{alert.description}</p>

                      <div className="flex items-center gap-4 pl-5 text-[10px] font-mono text-zinc-500">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {format(new Date(alert.timestamp), 'HH:mm:ss')}
                        </span>
                        <span className="flex items-center gap-1 uppercase">
                          <MapPin className="h-3 w-3" />
                          {alert.location}
                        </span>
                        {alert.status === 'resolved' && (
                          <span className="flex items-center gap-1 text-green-500">
                            <CheckCircle2 className="h-3 w-3" /> RESOLVED
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setViewAlert(alert)} className="p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors" title="View Map Context">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors" title="Archive Alert">
                        <Archive className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {!filteredAlerts?.length && (
              <div className="h-full flex flex-col items-center justify-center text-zinc-600 opacity-50">
                <Shield className="h-16 w-16 mb-4 stroke-[1]" />
                <p className="font-mono text-xs uppercase tracking-widest">No Active Threats Detected</p>
              </div>
            )}
          </div>
        </div>

        {/* Alert Map Visualization Modal */}
        <AnimatePresence>
          {viewAlert && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setViewAlert(null)}
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              />
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-black border border-white/10 rounded-2xl overflow-hidden relative z-10 w-full max-w-2xl shadow-2xl"
              >
                <div className="h-80 bg-zinc-900 relative">
                  {/* Mock Map Background */}
                  <div className="absolute inset-0 opacity-20 bg-[url('https://upload.wikimedia.org/wikipedia/commons/e/ec/World_map_blank_without_borders.svg')] bg-cover bg-center grayscale" />
                  {/* Grid Overlay */}
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />

                  {/* Ping Location */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <div className="relative">
                      <div className="w-4 h-4 bg-red-500 rounded-full animate-ping absolute inset-0" />
                      <div className="w-4 h-4 bg-red-500 rounded-full relative shadow-[0_0_20px_#ef4444] border-2 border-white" />
                    </div>
                  </div>
                  <div className="absolute top-1/2 left-1/2 mt-6 -translate-x-1/2 bg-black/80 px-3 py-1 rounded text-[10px] font-black text-white uppercase tracking-widest border border-white/10 whitespace-nowrap">
                    LOC: {viewAlert.location}
                  </div>

                  <div className="absolute top-4 left-4">
                    <span className="text-[10px] font-mono text-red-500 uppercase tracking-widest bg-red-500/10 px-2 py-1 rounded border border-red-500/20">Satellite_Link_Active</span>
                  </div>
                </div>

                <div className="p-6 bg-zinc-950 border-t border-white/10">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-lg font-black text-white uppercase tracking-widest">{viewAlert.title}</h3>
                      <p className="text-xs text-zinc-500 font-mono tracking-wider">{format(new Date(viewAlert.timestamp), 'PPP p')} // ID: {viewAlert.id}</p>
                    </div>
                    <button onClick={() => setViewAlert(null)} className="p-2 hover:bg-white/10 rounded-full transition-all">
                      <X className="h-5 w-5 text-zinc-400" />
                    </button>
                  </div>
                  <p className="text-sm text-zinc-300 leading-relaxed font-light">{viewAlert.description}</p>

                  <div className="mt-6 flex justify-end gap-3">
                    <button onClick={() => setViewAlert(null)} className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] font-black text-white uppercase tracking-widest transition-all">Dismiss</button>
                    <button onClick={() => setViewAlert(null)} className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-[10px] font-black text-white uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(239,68,68,0.4)]">Dispatch_Unit</button>
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

