import { Layout } from "@/components/Layout";
import { PageTransition } from "@/components/ui/PageTransition";
import { AlertTriangle, Shield, Search, Filter, Database, MapPin, Clock, Camera } from "lucide-react";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface Suspect {
    _id: string;
    suspectName: string;
    detectionId: string;
    confidence: number;
    threatLevel: 'critical' | 'suspicious' | 'normal';
    detectedAt: string;
    location: {
        cameraId: string;
        name: string;
        coordinates: {
            lat: number;
            lng: number;
        };
    };
    metadata: {
        bbox?: {
            x: number;
            y: number;
            width: number;
            height: number;
        };
        alertId?: string;
        description?: string;
    };
}

type ThreatFilter = 'all' | 'critical' | 'suspicious' | 'normal';

export default function Suspects() {
    const [suspects, setSuspects] = useState<Suspect[]>([]);
    const [filteredSuspects, setFilteredSuspects] = useState<Suspect[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [threatFilter, setThreatFilter] = useState<ThreatFilter>('all');

    // Load suspects from MongoDB
    useEffect(() => {
        const loadSuspects = async () => {
            try {
                setIsLoading(true);
                const response = await fetch('/api/suspects?limit=200');
                if (response.ok) {
                    const data = await response.json();
                    setSuspects(data);
                    setFilteredSuspects(data);
                } else {
                    console.error('Failed to load suspects:', response.statusText);
                }
            } catch (error) {
                console.error('Error fetching suspects:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadSuspects();
    }, []);

    // Listen for real-time alerts
    useEffect(() => {
        const handleNewAlert = (e: CustomEvent<any>) => {
            const alert = e.detail;

            // Only add if it's a suspect detection
            if (!alert) return;

            const newSuspect: Suspect = {
                _id: alert.detection_id || `temp_${Date.now()}`,
                suspectName: alert.object || 'UNKNOWN',
                detectionId: alert.detection_id || `det_${Date.now()}`,
                confidence: parseFloat(alert.confidence) || 0,
                threatLevel: alert.priority === 'CRITICAL' ? 'critical' :
                    alert.priority === 'HIGH' ? 'suspicious' : 'normal',
                detectedAt: alert.timestamp || new Date().toISOString(),
                location: {
                    cameraId: 'CAM_LIVE',
                    name: alert.location || 'Live Feed',
                    coordinates: alert.coordinates || { lat: 0, lng: 0 }
                },
                metadata: {
                    alertId: alert.alert_id,
                    description: alert.description
                }
            };

            setSuspects(prev => [newSuspect, ...prev]);
        };

        window.addEventListener('new-alert' as any, handleNewAlert);
        return () => window.removeEventListener('new-alert' as any, handleNewAlert);
    }, []);

    // Apply filters and search
    useEffect(() => {
        let filtered = [...suspects];

        // Apply threat level filter
        if (threatFilter !== 'all') {
            filtered = filtered.filter(s => s.threatLevel === threatFilter);
        }

        // Apply search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(s =>
                s.suspectName.toLowerCase().includes(query) ||
                s.detectionId.toLowerCase().includes(query) ||
                s.location?.name?.toLowerCase().includes(query)
            );
        }

        setFilteredSuspects(filtered);
    }, [suspects, searchQuery, threatFilter]);

    const getThreatColor = (level: string) => {
        switch (level) {
            case 'critical': return 'red';
            case 'suspicious': return 'yellow';
            default: return 'green';
        }
    };

    const stats = {
        total: suspects.length,
        critical: suspects.filter(s => s.threatLevel === 'critical').length,
        suspicious: suspects.filter(s => s.threatLevel === 'suspicious').length,
        normal: suspects.filter(s => s.threatLevel === 'normal').length,
    };

    return (
        <Layout>
            <PageTransition className="space-y-8 h-full flex flex-col">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-white/5 pb-10 relative">
                    <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-blue-500/20 via-transparent to-transparent" />

                    <div>
                        <div className="flex items-center gap-4 mb-2">
                            <div className="relative">
                                <div className="absolute inset-0 bg-blue-500/20 blur-md animate-pulse" />
                                <div className="relative p-2.5 bg-zinc-900 border border-white/10 rounded">
                                    <Database className="h-6 w-6 text-blue-500" />
                                </div>
                            </div>
                            <div>
                                <h1 className="text-4xl font-black text-white tracking-widest uppercase leading-none">SUSPECT_DATABASE</h1>
                                <p className="text-[10px] text-zinc-500 font-mono tracking-[0.4em] uppercase mt-2">MONGODB // HISTORICAL_RECORDS</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 text-xs">
                        <div className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/30 rounded">
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                            <span className="text-red-400 font-mono font-bold">{stats.critical} CRITICAL</span>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-yellow-500/10 border border-yellow-500/30 rounded">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                            <span className="text-yellow-400 font-mono font-bold">{stats.suspicious} SUSPICIOUS</span>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/30 rounded">
                            <div className="w-2 h-2 bg-green-500 rounded-full" />
                            <span className="text-green-400 font-mono font-bold">{stats.normal} NORMAL</span>
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <input
                            type="text"
                            placeholder="Search by name, ID, or location..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-lg text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-500/50 transition-colors"
                        />
                    </div>

                    {/* Filter */}
                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-zinc-500" />
                        <select
                            value={threatFilter}
                            onChange={(e) => setThreatFilter(e.target.value as ThreatFilter)}
                            className="px-4 py-2.5 bg-black/40 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500/50 transition-colors appearance-none cursor-pointer"
                        >
                            <option value="all">All Threats ({stats.total})</option>
                            <option value="critical">Critical ({stats.critical})</option>
                            <option value="suspicious">Suspicious ({stats.suspicious})</option>
                            <option value="normal">Normal ({stats.normal})</option>
                        </select>
                    </div>
                </div>

                {/* Suspects Grid */}
                <div className="flex-1 bg-black/60 backdrop-blur-xl border border-white/10 rounded-xl flex flex-col relative shadow-2xl overflow-hidden">
                    {/* HUD Accents */}
                    <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white/20" />
                    <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-white/20" />

                    {/* Header */}
                    <div className="bg-white/[0.03] px-6 py-4 border-b border-white/5 flex gap-4 items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex gap-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-red-500/40" />
                                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/40" />
                                <div className="w-2.5 h-2.5 rounded-full bg-green-500/40" />
                            </div>
                            <div className="h-3 w-px bg-white/10 mx-2" />
                            <span className="text-[10px] text-zinc-500 font-black tracking-widest uppercase">
                                SUSPECT_RECORDS // {filteredSuspects.length} ENTRIES
                            </span>
                        </div>
                        <div className="flex gap-4 text-[10px] uppercase font-black text-zinc-600 tracking-widest">
                            <span>DATABASE: MONGODB</span>
                        </div>
                    </div>

                    {/* Suspects List */}
                    <div className="flex-1 p-6 overflow-y-auto">
                        {isLoading ? (
                            <div className="h-full flex items-center justify-center">
                                <div className="text-center">
                                    <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
                                    <p className="text-zinc-500 text-sm font-mono">Loading suspects...</p>
                                </div>
                            </div>
                        ) : filteredSuspects.length > 0 ? (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                <AnimatePresence initial={false}>
                                    {filteredSuspects.map((suspect) => {
                                        const color = getThreatColor(suspect.threatLevel);
                                        return (
                                            <motion.div
                                                key={suspect._id}
                                                layout
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                                className={cn(
                                                    "p-5 rounded-lg border backdrop-blur-sm transition-all hover:border-opacity-60",
                                                    color === 'red' && "bg-red-500/5 border-red-500/30 hover:bg-red-500/10",
                                                    color === 'yellow' && "bg-yellow-500/5 border-yellow-500/30 hover:bg-yellow-500/10",
                                                    color === 'green' && "bg-green-500/5 border-green-500/30 hover:bg-green-500/10"
                                                )}
                                            >
                                                {/* Header Row */}
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="flex items-center gap-3">
                                                        {suspect.threatLevel === 'critical' && (
                                                            <AlertTriangle className="w-5 h-5 text-red-500 animate-pulse flex-shrink-0" />
                                                        )}
                                                        {suspect.threatLevel === 'suspicious' && (
                                                            <Shield className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                                                        )}
                                                        {suspect.threatLevel === 'normal' && (
                                                            <Shield className="w-5 h-5 text-green-500 flex-shrink-0" />
                                                        )}
                                                        <div>
                                                            <h3 className={cn(
                                                                "text-base font-black uppercase tracking-wider",
                                                                color === 'red' && "text-red-400",
                                                                color === 'yellow' && "text-yellow-400",
                                                                color === 'green' && "text-green-400"
                                                            )}>
                                                                {suspect.suspectName}
                                                            </h3>
                                                            <p className="text-[10px] text-zinc-500 font-mono mt-0.5">
                                                                ID: {suspect.detectionId.substring(0, 16)}...
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="text-right">
                                                        <div className={cn(
                                                            "text-sm font-bold font-mono",
                                                            color === 'red' && "text-red-500",
                                                            color === 'yellow' && "text-yellow-500",
                                                            color === 'green' && "text-green-500"
                                                        )}>
                                                            {suspect.confidence.toFixed(1)}%
                                                        </div>
                                                        <div className="text-[10px] text-zinc-600 uppercase font-black mt-1">
                                                            CONFIDENCE
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Details Grid */}
                                                <div className="grid grid-cols-2 gap-3 mb-3">
                                                    <div className="flex items-center gap-2 text-xs">
                                                        <Clock className="w-3.5 h-3.5 text-zinc-500" />
                                                        <div>
                                                            <div className="text-zinc-400 font-mono">
                                                                {format(new Date(suspect.detectedAt), 'MMM dd, HH:mm:ss')}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs">
                                                        <Camera className="w-3.5 h-3.5 text-zinc-500" />
                                                        <div className="text-zinc-400 font-mono">
                                                            {suspect.location?.cameraId || 'UNKNOWN'}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Location */}
                                                {suspect.location?.name && (
                                                    <div className="flex items-center gap-2 text-xs mb-3">
                                                        <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                                                        <div className="text-zinc-400">
                                                            {suspect.location.name}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Threat Badge */}
                                                <div className={cn(
                                                    "text-xs px-2 py-1 rounded inline-block font-mono font-bold uppercase",
                                                    color === 'red' && "bg-red-500/20 text-red-400 border border-red-500/30",
                                                    color === 'yellow' && "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
                                                    color === 'green' && "bg-green-500/20 text-green-400 border border-green-500/30"
                                                )}>
                                                    {suspect.threatLevel} THREAT
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <div className="h-full flex items-center justify-center">
                                <div className="text-center">
                                    <Shield className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
                                    <p className="text-zinc-600 text-sm font-mono">
                                        {searchQuery || threatFilter !== 'all'
                                            ? 'No suspects match your filters'
                                            : 'No suspects in database'}
                                    </p>
                                    <p className="text-zinc-700 text-xs mt-2">
                                        {searchQuery || threatFilter !== 'all'
                                            ? 'Try adjusting your search or filter'
                                            : 'Suspects will appear here when detected'}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </PageTransition>
        </Layout>
    );
}
