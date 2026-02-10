import { Layout } from "@/components/Layout";
import { useLogs } from "@/hooks/use-logs";
import { useCameraStream } from "@/hooks/useCameraStream";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { PageTransition } from "@/components/ui/PageTransition";
import { Search, Download, RefreshCcw, Terminal, Activity, FileText, Play, Pause, X, ChevronRight, Cpu, BarChart3, PieChart as PieIcon } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { motion, AnimatePresence } from "framer-motion";

export default function Logs() {
  const { data: initialLogs } = useLogs();
  const [logs, setLogs] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [isLive, setIsLive] = useState(false);
  const [viewLog, setViewLog] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Initialize logs
  // Ensure we receive alerts even without dashboard open
  useCameraStream('CAM_SRG_001', true); // Keep connection alive for logs

  useEffect(() => {
    if (initialLogs) {
      setLogs(initialLogs);
    }

    const handleNewAlert = (e: CustomEvent<any>) => {
      const alert = e.detail;

      // User requested ONLY red (critical) threats in logs
      if (alert.priority !== 'CRITICAL') return;

      const newLog = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        level: 'error',
        action: 'THREAT_DETECTED',
        user: 'AI_SENTINEL',
        details: `${alert.type} detected at ${alert.location || 'Unknown'} (Confidence: ${alert.confidence})`
      };
      setLogs(prev => [newLog, ...prev].slice(0, 100)); // Prepend

      // Auto scroll to top
      if (scrollRef.current) {
        scrollRef.current.scrollTop = 0;
      }
    };

    window.addEventListener('new-alert' as any, handleNewAlert);
    return () => window.removeEventListener('new-alert' as any, handleNewAlert);
  }, [initialLogs]);

  // Live Stream Simulation
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      const newLog = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        level: Math.random() > 0.9 ? 'error' : Math.random() > 0.7 ? 'warning' : 'info',
        action: ['AUTH_REQ', 'PACKET_IN', 'SYS_PING', 'DB_WRITE', 'API_GET'][Math.floor(Math.random() * 5)],
        user: ['SYSTEM', 'admin', 'watcher_01', 'unknown'][Math.floor(Math.random() * 4)],
        details: `Simulated event stream data packet #${Math.floor(Math.random() * 1000)}`
      };

      setLogs(prev => [newLog, ...prev].slice(0, 100)); // Keep last 100

      // Auto scroll to top
      if (scrollRef.current) {
        scrollRef.current.scrollTop = 0;
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [isLive]);

  const filteredLogs = logs.filter(log =>
    log.action.toLowerCase().includes(search.toLowerCase()) ||
    log.details?.toLowerCase().includes(search.toLowerCase()) ||
    log.user.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout>
      <PageTransition className="space-y-8 h-full flex flex-col relative">
        {/* Matrix Background Effect */}
        {isLive && (
          <div className="absolute inset-0 pointer-events-none opacity-5 z-0 overflow-hidden font-mono text-[10px] leading-3 text-green-500 break-words whitespace-pre-wrap">
            {Array.from({ length: 4000 }).map(() => Math.random() > 0.5 ? '1' : '0').join('')}
          </div>
        )}

        {/* HUD Header */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-white/5 pb-10 relative z-10">
          <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-blue-500/20 via-transparent to-transparent" />

          <div>
            <div className="flex items-center gap-4 mb-2">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500/20 blur-md animate-pulse" />
                <div className="relative p-2.5 bg-zinc-900 border border-white/10 rounded">
                  <Terminal className="h-6 w-6 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-4xl font-black text-white tracking-widest uppercase leading-none">SYSTEM_LOGS</h1>
                <p className="text-[10px] text-zinc-500 font-mono tracking-[0.4em] uppercase mt-2">KERNEL_STREAM // RING_STATUS_0</p>
              </div>
            </div>
          </div>

          {/* Log Analytics Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Event Volume Trend */}
            <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-xl p-4 flex flex-col relative shadow-xl h-48">
              <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white/20" />
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4 text-blue-500" />
                <h3 className="text-xs font-black tracking-wider uppercase text-white">EVENT_THROUGHPUT_HZ</h3>
              </div>
              <div className="flex-1 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={[
                    { time: '00', events: 120 }, { time: '04', events: 140 },
                    { time: '08', events: 250 }, { time: '12', events: 450 },
                    { time: '16', events: 380 }, { time: '20', events: 180 },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                    <XAxis dataKey="time" stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip
                      cursor={{ stroke: '#ffffff20' }}
                      contentStyle={{ backgroundColor: '#000000dd', border: '1px solid #ffffff20', borderRadius: '4px', fontSize: '12px' }}
                    />
                    <Line type="step" dataKey="events" stroke="#3b82f6" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#3b82f6' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Event Type Breakdown */}
            <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-xl p-4 flex flex-col relative shadow-xl h-48">
              <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white/20" />
              <div className="flex items-center gap-2 mb-2">
                <PieIcon className="w-4 h-4 text-blue-500" />
                <h3 className="text-xs font-black tracking-wider uppercase text-white">PROTOCOL_DISTRIBUTION</h3>
              </div>
              <div className="flex-1 w-full flex items-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'AUTH', value: 350, color: '#3b82f6' },
                        { name: 'SYSTEM', value: 450, color: '#10b981' },
                        { name: 'NETWORK', value: 200, color: '#f59e0b' },
                        { name: 'ERROR', value: 50, color: '#ef4444' },
                      ]}
                      innerRadius={40}
                      outerRadius={60}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      <Cell fill="#3b82f6" />
                      <Cell fill="#10b981" />
                      <Cell fill="#f59e0b" />
                      <Cell fill="#ef4444" />
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#000000dd', border: '1px solid #ffffff20', borderRadius: '4px', fontSize: '12px' }}
                      itemStyle={{ color: '#fff' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-col gap-2 ml-4">
                  <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-400">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" /> AUTH
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-400">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full" /> SYS
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-400">
                    <div className="w-2 h-2 bg-red-500 rounded-full" /> ERR
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4 items-center">
            <button
              onClick={() => setIsLive(!isLive)}
              className={cn(
                "flex items-center gap-2 px-4 py-3 rounded-lg border text-xs font-black uppercase tracking-widest transition-all shadow-xl",
                isLive ? "bg-green-500/10 border-green-500/30 text-green-500 animate-pulse" : "bg-black/80 border-white/10 text-zinc-500 hover:text-white"
              )}
            >
              {isLive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {isLive ? 'LIVE_STREAM_ACTIVE' : 'START_STREAM'}
            </button>

            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="text"
                placeholder="GREP_LOG_INFO..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-black/80 border border-white/10 rounded-lg px-12 py-3 text-[11px] text-white focus:outline-none focus:border-blue-500/30 transition-all w-80 font-mono uppercase placeholder:text-zinc-700 shadow-xl"
              />
            </div>
          </div>
        </div>

        {/* Logs Terminal */}
        <div className="flex-1 bg-black/60 backdrop-blur-xl border border-white/10 rounded-xl flex flex-col font-mono text-sm relative shadow-2xl z-10">
          {/* HUD Accents */}
          <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white/20" />
          <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-white/20" />

          {/* Terminal Header */}
          <div className="bg-white/[0.03] px-6 py-4 border-b border-white/5 flex gap-4 items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/40" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/40" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/40" />
              </div>
              <div className="h-3 w-px bg-white/10 mx-2" />
              <span className="text-[10px] text-zinc-500 font-black tracking-widest uppercase">root@skywatch_core: ~ / var / log / audit.log</span>
            </div>
            <div className="flex gap-4 text-[10px] uppercase font-black text-zinc-600 tracking-widest">
              <span>PID: 4492</span>
              <span>MEM: 45MB</span>
              <span>CPU: 2%</span>
            </div>
          </div>

          {/* Log Stream */}
          <div ref={scrollRef} className="flex-1 p-4 space-y-1 relative font-mono text-xs">
            <AnimatePresence initial={false}>
              {filteredLogs.map((log) => (
                <motion.div
                  key={log.id}
                  layout
                  initial={{ opacity: 0, x: -10, height: 0 }}
                  animate={{ opacity: 1, x: 0, height: 'auto' }}
                  exit={{ opacity: 0 }}
                  onClick={() => setViewLog(log)}
                  className="flex gap-4 group hover:bg-white/5 p-1.5 rounded -mx-1 cursor-pointer transition-colors items-center border-l-2 border-transparent hover:border-blue-500/50"
                  style={{ willChange: 'transform' }} // Perf optimization
                >
                  <span className="text-zinc-600 shrink-0 select-none w-20">[{format(new Date(log.timestamp), 'HH:mm:ss')}]</span>

                  <span className={cn(
                    "shrink-0 w-16 uppercase font-bold text-[9px] py-0.5 text-center rounded border",
                    log.level === 'error' ? "text-red-500 border-red-500/30 bg-red-500/10" :
                      log.level === 'warning' ? "text-yellow-500 border-yellow-500/30 bg-yellow-500/10" :
                        "text-green-500 border-green-500/30 bg-green-500/10"
                  )}>
                    {log.level}
                  </span>

                  <span className="text-blue-400 font-bold shrink-0 w-32">{log.action}</span>

                  <span className="text-zinc-500 truncate group-hover:text-zinc-300 transition-colors flex-1">{log.details}</span>

                  <span className="text-zinc-600 shrink-0 w-24 text-right flex items-center justify-end gap-2">
                    {log.user}
                    <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Cursor Effect */}
            <motion.div
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 0.8, repeat: Infinity }}
              className="w-2 h-4 bg-green-500 mt-2"
            />
          </div>
        </div>

        {/* Log Detail Modal */}
        <AnimatePresence>
          {viewLog && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setViewLog(null)}
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              />
              <motion.div
                layoutId={`log-${viewLog.id}`} // Shared layout ID if we could link it (needs list item to have layoutId too)
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-zinc-950 border border-white/10 rounded-xl w-full max-w-2xl overflow-hidden relative z-10 shadow-2xl"
              >
                <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5">
                  <div className="flex items-center gap-3">
                    <span className={cn(
                      "uppercase font-bold text-[10px] px-2 py-0.5 rounded border",
                      viewLog.level === 'error' ? "text-red-500 border-red-500/30 bg-red-500/10" :
                        viewLog.level === 'warning' ? "text-yellow-500 border-yellow-500/30 bg-yellow-500/10" :
                          "text-green-500 border-green-500/30 bg-green-500/10"
                    )}>
                      {viewLog.level}
                    </span>
                    <h3 className="text-sm font-black text-white font-mono">{viewLog.action}</h3>
                  </div>
                  <button onClick={() => setViewLog(null)}><X className="h-5 w-5 text-zinc-500 hover:text-white" /></button>
                </div>

                <div className="p-6 font-mono text-xs space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] text-zinc-500 uppercase tracking-widest pl-1">Timestamp</label>
                    <div className="p-3 bg-black border border-white/10 rounded text-zinc-300">
                      {viewLog.timestamp}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] text-zinc-500 uppercase tracking-widest pl-1">Raw Payload</label>
                    <div className="p-4 bg-black border border-white/10 rounded text-green-500 overflow-auto max-h-48">
                      <pre>{JSON.stringify(viewLog, null, 2)}</pre>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                    <button className="px-4 py-2 border border-white/10 rounded text-zinc-400 hover:text-white hover:bg-white/5 transition-all text-[10px] uppercase font-black tracking-widest">
                      TRACE_ORIGIN
                    </button>
                    <button className="px-4 py-2 bg-blue-500/10 border border-blue-500/20 text-blue-500 rounded hover:bg-blue-500/20 transition-all text-[10px] uppercase font-black tracking-widest">
                      FLAG_FOR_AUDIT
                    </button>
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
