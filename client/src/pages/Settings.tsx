import { Layout } from "@/components/Layout";
import { Moon, Bell, Shield, Database, Users, Check, Activity, HardDrive, RefreshCw, Trash2, Key, Server, Cpu } from "lucide-react";
import { PageTransition } from "@/components/ui/PageTransition";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";

function Toggle({ label, sublabel, checked, onChange }: { label: string; sublabel: string; checked: boolean; onChange: () => void }) {
  return (
    <div className="flex items-center justify-between py-5 border-b border-white/5 last:border-0 cursor-pointer group" onClick={onChange}>
      <div>
        <p className="text-xs font-black text-white uppercase tracking-widest group-hover:text-primary transition-colors">{label}</p>
        <p className="text-[10px] text-zinc-500 font-mono tracking-tight mt-1">{sublabel}</p>
      </div>
      <div className={cn(
        "h-6 w-12 rounded-full relative transition-all duration-300 border",
        checked ? "bg-green-500/20 border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.1)]" : "bg-black/60 border-white/10"
      )}>
        <motion.div
          animate={{ x: checked ? 24 : 4 }}
          className={cn(
            "absolute top-1 h-3.5 w-3.5 rounded-sm shadow-xl transition-colors duration-300",
            checked ? "bg-green-500 shadow-[0_0_10px_#22c55e]" : "bg-zinc-700"
          )}
        />
      </div>
    </div>
  );
}

// Mock User Data
const users = [
  { id: 1, name: 'John Doe', role: 'ADMIN', lastActive: '2 min ago', access: 'FULL' },
  { id: 2, name: 'Security A', role: 'VIEWER', lastActive: '1 hr ago', access: 'READ_ONLY' },
  { id: 3, name: 'Audit Bot', role: 'SERVICE', lastActive: 'Active', access: 'API_KEY' },
];

import { useToast } from "@/hooks/use-toast";

// ... inside Config

export default function Settings() {
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const [settings, setSettings] = useState({
    compactMode: false,
    notifications: {
      critical: true,
      status: true,
      offline: true
    }
  });

  const [diagnostics, setDiagnostics] = useState<'idle' | 'running' | 'completed'>('idle');
  const [progress, setProgress] = useState(0);

  const runDiagnostics = () => {
    setDiagnostics('running');
    setProgress(0);
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setDiagnostics('completed');
          return 100;
        }
        return prev + 10;
      });
    }, 100);
  };

  const handleSettingChange = (key: string, value: boolean) => {
    toast({
      title: "CONFIG_UPDATE",
      description: `Protocol ${key} ${value ? 'ENABLED' : 'DISABLED'}`,
      variant: "default",
      className: "border-green-500/50 bg-black/90 text-green-500 font-mono"
    });
  };

  const handleDangerAction = () => {
    toast({
      title: "ACCESS_DENIED",
      description: "Root privileges required for termination sequence.",
      variant: "destructive",
      className: "border-red-500/50 bg-black/90 text-red-500 font-mono"
    });
  };

  return (
    <Layout>
      <PageTransition className="space-y-10">
        {/* HUD Header */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-white/5 pb-10 relative">
          <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-zinc-500/20 via-transparent to-transparent" />

          <div>
            <div className="flex items-center gap-4 mb-2">
              <div className="relative">
                <div className="absolute inset-0 bg-white/10 blur-md animate-pulse" />
                <div className="relative p-2.5 bg-zinc-900 border border-white/10 rounded">
                  <Database className="h-6 w-6 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-4xl font-black text-white tracking-widest uppercase leading-none">CORE_SETTINGS</h1>
                <p className="text-[10px] text-zinc-500 font-mono tracking-[0.4em] uppercase mt-2">SYSTEM_CONFIG // RING_0_ACCESS</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

          {/* Main Settings Column */}
          <div className="xl:col-span-2 space-y-6">
            {/* System Diagnostics Panel */}
            <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-8 relative overflow-hidden group shadow-xl">
              <h3 className="text-[10px] font-black text-white mb-6 uppercase tracking-[0.2em] flex items-center gap-4">
                <Activity className="h-4 w-4 text-blue-500" />
                SYSTEM_INTEGRITY_CHECK
              </h3>

              {diagnostics === 'idle' ? (
                <div className="flex items-center justify-between">
                  <p className="text-xs text-zinc-400 font-mono max-w-sm">Run a full diagnostic scan to check database latency, satellite uplink stability, and API health.</p>
                  <button
                    onClick={runDiagnostics}
                    className="px-6 py-3 bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded-lg text-xs font-black uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all shadow-xl flex items-center gap-2"
                  >
                    <RefreshCw className="h-4 w-4" /> Run_Diagnostics
                  </button>
                </div>
              ) : diagnostics === 'running' ? (
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] uppercase font-bold text-zinc-400">
                    <span>Scanning Protocols...</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-blue-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4 mt-4 opacity-50">
                    <div className="text-[9px] font-mono text-zinc-500">CHECKING_DB...</div>
                    <div className="text-[9px] font-mono text-zinc-500">PINGING_NODES...</div>
                    <div className="text-[9px] font-mono text-zinc-500">VERIFYING_HASH...</div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4 text-green-500 bg-green-500/5 p-4 rounded-xl border border-green-500/10">
                  <Check className="h-6 w-6" />
                  <div>
                    <h4 className="font-bold uppercase tracking-widest text-sm">All Systems Nominal</h4>
                    <p className="text-[10px] text-zinc-500 font-mono mt-1">Scan ID: #8829-X • No anomalies found.</p>
                  </div>
                  <button onClick={() => setDiagnostics('idle')} className="ml-auto text-xs underline text-zinc-500 hover:text-white">Reset</button>
                </div>
              )}
            </div>

            {/* Appearance */}
            <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-8 relative overflow-hidden group shadow-xl">
              <div className="absolute top-0 right-0 p-[2px] bg-gradient-to-l from-green-500/40 to-transparent w-full h-[1px]" />
              <h3 className="text-[10px] font-black text-white mb-6 uppercase tracking-[0.2em] flex items-center gap-4">
                <div className="p-2 bg-green-500/10 rounded-lg border border-green-500/20">
                  <Moon className="h-4 w-4 text-green-500" />
                </div>
                UI_ENVIRONMENT
              </h3>
              <div className="space-y-1">
                <Toggle
                  label="Dark Mode"
                  sublabel="FORCE_HIGH_CONTRAST_ENVIRONMENT"
                  checked={theme === 'dark'}
                  onChange={() => {
                    const newTheme = theme === 'dark' ? 'light' : 'dark';
                    setTheme(newTheme);
                    handleSettingChange("DARK_MODE", newTheme === 'dark');
                  }}
                />
                <Toggle
                  label="Compact Mode"
                  sublabel="MAXIMIZE_DATA_DENSITY_PROTOCOL"
                  checked={settings.compactMode}
                  onChange={() => {
                    const newVal = !settings.compactMode;
                    setSettings(s => ({ ...s, compactMode: newVal }));
                    handleSettingChange("COMPACT_VIEW", newVal);
                  }}
                />
              </div>
            </div>

            {/* Notifications */}
            <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-8 relative overflow-hidden group shadow-xl">
              <div className="absolute top-0 right-0 p-[2px] bg-gradient-to-l from-green-500/40 to-transparent w-full h-[1px]" />
              <h3 className="text-[10px] font-black text-white mb-6 uppercase tracking-[0.2em] flex items-center gap-4">
                <div className="p-2 bg-green-500/10 rounded-lg border border-green-500/20">
                  <Bell className="h-4 w-4 text-green-500" />
                </div>
                ALERT_DISPATCH_CONFIG
              </h3>
              <div className="space-y-1">
                <Toggle
                  label="Critical Alerts"
                  sublabel="IMMEDIATE_BREACH_NOTIFICATIONS"
                  checked={settings.notifications.critical}
                  onChange={() => {
                    const newVal = !settings.notifications.critical;
                    setSettings(s => ({ ...s, notifications: { ...s.notifications, critical: newVal } }));
                    handleSettingChange("CRITICAL_ALERTS", newVal);
                  }}
                />
                <Toggle
                  label="System Status"
                  sublabel="REAL_TIME_HEALTH_MONITORING"
                  checked={settings.notifications.status}
                  onChange={() => {
                    const newVal = !settings.notifications.status;
                    setSettings(s => ({ ...s, notifications: { ...s.notifications, status: newVal } }));
                    handleSettingChange("STATUS_ALERTS", newVal);
                  }}
                />
                <Toggle
                  label="Node Disconnect"
                  sublabel="SENSOR_OFFLINE_TRIGGERS"
                  checked={settings.notifications.offline}
                  onChange={() => {
                    const newVal = !settings.notifications.offline;
                    setSettings(s => ({ ...s, notifications: { ...s.notifications, offline: newVal } }));
                    handleSettingChange("OFFLINE_ALERTS", newVal);
                  }}
                />
              </div>
            </div>
          </div>

          {/* Sidebar Column */}
          <div className="space-y-8">
            {/* Storage Viz */}
            <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl space-y-6">
              <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em] flex items-center gap-2">
                <HardDrive className="h-4 w-4 text-purple-500" />
                Storage_Metrics
              </h3>

              <div className="relative w-40 h-40 mx-auto">
                {/* Ring Chart CSS Implementation */}
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path className="text-zinc-800" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                  <path className="text-purple-500" strokeDasharray="75, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-black text-white">75%</span>
                  <span className="text-[8px] uppercase tracking-widest text-zinc-500">Used</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-[10px] font-mono text-zinc-400 uppercase">
                  <span>Total Cap</span>
                  <span className="text-white">40 TB</span>
                </div>
                <div className="flex justify-between text-[10px] font-mono text-zinc-400 uppercase">
                  <span>Available</span>
                  <span className="text-white">10 TB</span>
                </div>
                <div className="flex justify-between text-[10px] font-mono text-zinc-400 uppercase">
                  <span>Est. Retention</span>
                  <span className="text-white">45 Days</span>
                </div>
                <button
                  onClick={() => toast({ title: "ARCHIVE_INIT", description: "Offloading 10TB to cold storage...", className: "bg-purple-500/10 border-purple-500/50 text-purple-500" })}
                  className="w-full py-2 bg-purple-500/10 text-purple-500 border border-purple-500/20 rounded font-black text-[9px] uppercase tracking-widest hover:bg-purple-500/20 transition-all"
                >
                  Offload_Archive
                </button>
              </div>
            </div>

            {/* User Management Mini-Table */}
            <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl">
              <h3 className="text-[10px] font-black text-white mb-6 uppercase tracking-[0.2em] flex items-center gap-2">
                <Users className="h-4 w-4 text-orange-500" />
                Active_Personnel
              </h3>

              <div className="space-y-4">
                {users.map(u => (
                  <div key={u.id} className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/5 rounded-lg group hover:border-white/10 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-zinc-800 flex items-center justify-center font-bold text-xs text-zinc-400">
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-white uppercase">{u.name}</div>
                        <div className="text-[8px] font-mono text-zinc-500">{u.role}</div>
                      </div>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => toast({ title: "CREDENTIALS_RESET", description: `Reset link sent to ${u.name}` })}
                        className="p-1.5 hover:bg-white/10 rounded"
                      >
                        <Key className="h-3 w-3 text-zinc-400" />
                      </button>
                      <button
                        onClick={() => toast({ title: "USER_REMOVED", description: `${u.name} access revoked.`, variant: "destructive" })}
                        className="p-1.5 hover:bg-red-500/20 rounded"
                      >
                        <Trash2 className="h-3 w-3 text-red-500" />
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => toast({ title: "NEW_UNIT_REGISTRY", description: "Opening personnel onboarding form..." })}
                  className="w-full py-2 border border-dashed border-white/10 rounded text-zinc-500 text-[10px] font-bold uppercase tracking-widest hover:text-white hover:border-white/30 transition-all"
                >
                  + Register_New_Unit
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="border border-red-500/20 bg-red-500/[0.02] rounded-2xl p-8 relative overflow-hidden shadow-xl max-w-3xl">
          <h3 className="text-[10px] font-black text-red-500 mb-6 uppercase tracking-[0.2em]">
            TERMINATION_LEVEL
          </h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black text-white uppercase tracking-widest">RESET_SYSTEM_ROOT</p>
              <p className="text-[9px] text-zinc-500 font-mono mt-1">IRREVERSIBLE_FACTORY_CLEANSE</p>
            </div>
            <button
              onClick={handleDangerAction}
              className="px-6 py-3 bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all shadow-xl"
            >
              INIT_WIPE
            </button>
          </div>
        </div>
      </PageTransition>
    </Layout >
  );
}
