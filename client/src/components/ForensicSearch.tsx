import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Search, X, Calendar, Camera, Tag } from 'lucide-react';
import { useState } from 'react';
import { ForensicSearchQuery, ObjectType, ThreatLevel } from '@/../../shared/types/analytics';
import { cn } from '@/lib/utils';

interface ForensicSearchProps {
    onSearch: (query: ForensicSearchQuery) => void;
}

export function ForensicSearch({ onSearch }: ForensicSearchProps) {
    const [searchText, setSearchText] = useState('');
    const [activeFilters, setActiveFilters] = useState<string[]>([]);

    const examples = [
        'White SUV from 3 days ago',
        'Person in red jacket',
        'Unattended baggage',
        'Vehicle at Gate A',
    ];

    const quickFilters = [
        { id: 'person', label: 'Person', icon: '👤', type: 'objectType' },
        { id: 'vehicle', label: 'Vehicle', icon: '🚗', type: 'objectType' },
        { id: 'critical', label: 'Critical', icon: '🔴', type: 'threat' },
        { id: 'today', label: 'Today', icon: '📅', type: 'time' },
    ];

    const toggleFilter = (filterId: string) => {
        setActiveFilters((prev) =>
            prev.includes(filterId)
                ? prev.filter((id) => id !== filterId)
                : [...prev, filterId]
        );
    };

    const handleSearch = () => {
        const query: ForensicSearchQuery = {
            text: searchText || undefined,
            objectType: activeFilters.includes('person')
                ? ObjectType.PERSON
                : activeFilters.includes('vehicle')
                    ? ObjectType.VEHICLE
                    : undefined,
            threatLevel: activeFilters.includes('critical') ? ThreatLevel.CRITICAL : undefined,
            startDate: activeFilters.includes('today')
                ? new Date(new Date().setHours(0, 0, 0, 0))
                : undefined,
        };
        onSearch(query);
    };

    return (
        <Card className="bg-black/40 border-white/10 backdrop-blur-md overflow-hidden">
            <div className="p-4 space-y-4">
                {/* Header */}
                <div className="flex items-center gap-2">
                    <Search className="w-4 h-4 text-cyan-500" />
                    <h3 className="text-xs font-black tracking-wider uppercase text-white">
                        FORENSIC SEARCH
                    </h3>
                </div>

                {/* Search Input */}
                <div className="relative">
                    <Input
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        placeholder="Search events, objects, or describe..."
                        className="bg-zinc-900/50 border-white/10 text-white placeholder:text-zinc-600 font-mono text-sm pr-10"
                    />
                    {searchText && (
                        <button
                            onClick={() => setSearchText('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* Quick Filters */}
                <div>
                    <div className="text-[10px] text-zinc-500 font-mono mb-2">QUICK_FILTERS</div>
                    <div className="flex flex-wrap gap-2">
                        {quickFilters.map((filter) => {
                            const isActive = activeFilters.includes(filter.id);
                            return (
                                <motion.button
                                    key={filter.id}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => toggleFilter(filter.id)}
                                    className={cn(
                                        'px-3 py-1.5 rounded border text-xs font-mono transition-all',
                                        isActive
                                            ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
                                            : 'bg-zinc-900/50 text-zinc-400 border-white/10 hover:border-white/20'
                                    )}
                                >
                                    <span className="mr-1">{filter.icon}</span>
                                    {filter.label}
                                </motion.button>
                            );
                        })}
                    </div>
                </div>

                {/* Active Filters */}
                {activeFilters.length > 0 && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="flex items-center gap-2 flex-wrap"
                    >
                        <span className="text-[10px] text-zinc-500 font-mono">ACTIVE:</span>
                        {activeFilters.map((filterId) => {
                            const filter = quickFilters.find((f) => f.id === filterId);
                            return (
                                <Badge
                                    key={filterId}
                                    className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 text-[10px] font-mono"
                                >
                                    {filter?.label}
                                    <button
                                        onClick={() => toggleFilter(filterId)}
                                        className="ml-1 hover:text-white"
                                    >
                                        ×
                                    </button>
                                </Badge>
                            );
                        })}
                    </motion.div>
                )}

                {/* Examples */}
                <div>
                    <div className="text-[10px] text-zinc-500 font-mono mb-2">EXAMPLES</div>
                    <div className="space-y-1">
                        {examples.map((example, index) => (
                            <motion.button
                                key={index}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                onClick={() => setSearchText(example)}
                                className="w-full text-left px-3 py-2 text-xs text-zinc-400 hover:text-white bg-zinc-900/30 hover:bg-zinc-900/50 rounded border border-transparent hover:border-white/10 transition-all font-mono"
                            >
                                → {example}
                            </motion.button>
                        ))}
                    </div>
                </div>

                {/* Search Button */}
                <Button
                    onClick={handleSearch}
                    className="w-full bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-500/30 font-mono text-xs"
                >
                    <Search className="w-3 h-3 mr-2" />
                    SEARCH DATABASE
                </Button>

                {/* Search History */}
                <div className="pt-4 border-t border-white/5">
                    <div className="text-[10px] text-zinc-500 font-mono mb-2">RECENT_SEARCHES</div>
                    <div className="space-y-1 text-[10px] text-zinc-600 font-mono">
                        <div className="flex items-center gap-2">
                            <span className="text-zinc-700">•</span>
                            Person detected 2h ago
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-zinc-700">•</span>
                            Vehicle Gate B yesterday
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
}
