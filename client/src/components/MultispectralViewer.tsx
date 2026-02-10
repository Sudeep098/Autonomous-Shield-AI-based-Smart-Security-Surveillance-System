import { SpectralMode } from '@/../../shared/types/analytics';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Eye, Flame, Zap, Info } from 'lucide-react';
import { useState } from 'react';

interface MultispectralViewerProps {
    cameraId: string;
    currentMode: SpectralMode;
    onModeChange: (mode: SpectralMode) => void;
    weatherSuggestion?: string;
}

export function MultispectralViewer({
    cameraId,
    currentMode,
    onModeChange,
    weatherSuggestion
}: MultispectralViewerProps) {
    const [isTransitioning, setIsTransitioning] = useState(false);

    const modes = [
        {
            mode: SpectralMode.VISIBLE,
            label: '4K',
            icon: Eye,
            color: 'cyan',
            description: 'Standard High Definition'
        },
        {
            mode: SpectralMode.THERMAL,
            label: 'THERMAL',
            icon: Flame,
            color: 'orange',
            description: 'Heat Signature Detection'
        },
        {
            mode: SpectralMode.INFRARED,
            label: 'IR',
            icon: Zap,
            color: 'purple',
            description: 'Night Vision Mode'
        },
    ];

    const handleModeChange = (newMode: SpectralMode) => {
        if (newMode === currentMode || isTransitioning) return;

        setIsTransitioning(true);
        setTimeout(() => {
            onModeChange(newMode);
            setIsTransitioning(false);
        }, 300);
    };

    const getColorClass = (color: string, variant: 'bg' | 'text' | 'border' | 'shadow') => {
        const colorMap: Record<string, Record<string, string>> = {
            cyan: {
                bg: 'bg-cyan-500/20',
                text: 'text-cyan-400',
                border: 'border-cyan-500/30',
                shadow: 'shadow-cyan-500/50',
            },
            orange: {
                bg: 'bg-orange-500/20',
                text: 'text-orange-400',
                border: 'border-orange-500/30',
                shadow: 'shadow-orange-500/50',
            },
            purple: {
                bg: 'bg-purple-500/20',
                text: 'text-purple-400',
                border: 'border-purple-500/30',
                shadow: 'shadow-purple-500/50',
            },
        };
        return colorMap[color]?.[variant] || '';
    };

    const activeModeConfig = modes.find(m => m.mode === currentMode);

    return (
        <div className="space-y-3">
            {/* Mode Selector */}
            <Card className="bg-black/60 border-white/10 backdrop-blur-md overflow-hidden">
                <div className="p-3">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase">
                            SPECTRAL MODE
                        </div>
                        {activeModeConfig && (
                            <Badge className={cn(
                                'font-mono text-[10px] border',
                                getColorClass(activeModeConfig.color, 'bg'),
                                getColorClass(activeModeConfig.color, 'text'),
                                getColorClass(activeModeConfig.color, 'border')
                            )}>
                                {activeModeConfig.label}
                            </Badge>
                        )}
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                        {modes.map(({ mode, label, icon: Icon, color }) => {
                            const isActive = mode === currentMode;
                            return (
                                <Button
                                    key={mode}
                                    size="sm"
                                    onClick={() => handleModeChange(mode)}
                                    disabled={isTransitioning}
                                    className={cn(
                                        'relative overflow-hidden font-mono text-xs transition-all duration-300 border',
                                        isActive
                                            ? `${getColorClass(color, 'bg')} ${getColorClass(color, 'text')} ${getColorClass(color, 'border')} shadow-[0_0_15px] ${getColorClass(color, 'shadow')}`
                                            : 'bg-zinc-900/50 text-zinc-500 border-white/10 hover:border-white/20 hover:text-white'
                                    )}
                                >
                                    <Icon className="w-3 h-3 mr-1.5" />
                                    {label}
                                    {isActive && (
                                        <motion.div
                                            layoutId="active-mode-indicator"
                                            className={cn(
                                                'absolute inset-0 border-2 rounded',
                                                getColorClass(color, 'border')
                                            )}
                                            transition={{ type: 'spring', duration: 0.5 }}
                                        />
                                    )}
                                </Button>
                            );
                        })}
                    </div>

                    {/* Mode Description */}
                    <AnimatePresence mode="wait">
                        {activeModeConfig && (
                            <motion.div
                                key={currentMode}
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="mt-3 pt-3 border-t border-white/5"
                            >
                                <p className="text-[11px] text-zinc-400">
                                    {activeModeConfig.description}
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </Card>

            {/* Weather-Based Suggestion */}
            <AnimatePresence>
                {weatherSuggestion && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                    >
                        <Card className="bg-amber-500/10 border-amber-500/30 backdrop-blur-md">
                            <div className="p-3 flex items-start gap-2">
                                <Info className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                                <div className="flex-1">
                                    <p className="text-[10px] text-amber-500 font-mono font-bold mb-1">
                                        VISIBILITY ALERT
                                    </p>
                                    <p className="text-xs text-amber-300/90">
                                        {weatherSuggestion}
                                    </p>
                                </div>
                                <Button
                                    size="sm"
                                    onClick={() => handleModeChange(SpectralMode.THERMAL)}
                                    className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/30 font-mono text-[10px] h-7"
                                >
                                    SWITCH
                                </Button>
                            </div>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Transition Overlay */}
            <AnimatePresence>
                {isTransitioning && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center pointer-events-none"
                    >
                        <div className="text-center">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                className="w-12 h-12 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full mx-auto mb-2"
                            />
                            <p className="text-sm text-cyan-400 font-mono">MODE_TRANSITION</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
