import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { DetectedObject, ObjectType } from '@/../../shared/types/analytics';
import { User, Car, Package } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ObjectGalleryProps {
    objects: DetectedObject[];
    onObjectClick: (object: DetectedObject) => void;
}

export function ObjectGallery({ objects, onObjectClick }: ObjectGalleryProps) {
    const getObjectIcon = (type: ObjectType) => {
        switch (type) {
            case ObjectType.PERSON:
                return User;
            case ObjectType.VEHICLE:
                return Car;
            case ObjectType.BAGGAGE:
                return Package;
            default:
                return Package;
        }
    };

    const getTypeColor = (type: ObjectType) => {
        switch (type) {
            case ObjectType.PERSON:
                return 'cyan';
            case ObjectType.VEHICLE:
                return 'purple';
            case ObjectType.BAGGAGE:
                return 'amber';
            default:
                return 'zinc';
        }
    };

    const getConfidenceColor = (confidence: number) => {
        if (confidence > 0.9) return 'text-green-500';
        if (confidence > 0.7) return 'text-cyan-500';
        return 'text-amber-500';
    };

    return (
        <Card className="h-full bg-black/40 border-white/10 backdrop-blur-md overflow-hidden flex flex-col">
            <div className="p-3 border-b border-white/5">
                <h3 className="text-xs font-black tracking-wider uppercase text-white flex items-center gap-2">
                    <div className="w-1 h-3 bg-cyan-500 rounded-full" />
                    DETECTED OBJECTS
                    <Badge className="ml-auto bg-cyan-500/20 text-cyan-400 border-cyan-500/30 font-mono text-[10px]">
                        {objects.length} OBJECTS
                    </Badge>
                </h3>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {objects.map((obj, index) => {
                        const Icon = getObjectIcon(obj.type);
                        const color = getTypeColor(obj.type);

                        return (
                            <motion.div
                                key={obj.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.05 }}
                                whileHover={{ scale: 1.05 }}
                                onClick={() => onObjectClick(obj)}
                                className="cursor-pointer"
                            >
                                <Card className="bg-zinc-900/50 border-white/10 hover:border-cyan-500/30 transition-all overflow-hidden">
                                    {/* Image placeholder with icon */}
                                    <div className={cn(
                                        'aspect-square flex items-center justify-center relative overflow-hidden',
                                        `bg-${color}-500/10`
                                    )}>
                                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
                                        <Icon className={cn('w-12 h-12', `text-${color}-500/50`)} />

                                        {/* Confidence badge */}
                                        <div className="absolute top-2 right-2">
                                            <Badge className={cn(
                                                'bg-black/60 backdrop-blur-sm border font-mono text-[9px]',
                                                getConfidenceColor(obj.confidence),
                                                'border-current'
                                            )}>
                                                {(obj.confidence * 100).toFixed(0)}%
                                            </Badge>
                                        </div>

                                        {/* Scanline effect */}
                                        <motion.div
                                            initial={{ y: '-100%' }}
                                            animate={{ y: '100%' }}
                                            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                                            className="absolute inset-x-0 h-8 bg-gradient-to-b from-transparent via-white/10 to-transparent"
                                        />
                                    </div>

                                    {/* Object info */}
                                    <div className="p-2 space-y-1">
                                        <div className="flex items-center justify-between">
                                            <Badge className={cn(
                                                'text-[9px] font-mono border',
                                                `bg-${color}-500/20 text-${color}-400 border-${color}-500/30`
                                            )}>
                                                {obj.type}
                                            </Badge>
                                            <span className="text-[9px] text-zinc-500 font-mono">{obj.id}</span>
                                        </div>
                                        <div className="text-[10px] text-zinc-400 font-mono">
                                            {obj.timestamp.toLocaleTimeString()}
                                        </div>
                                        <div className="text-[9px] text-zinc-600 font-mono">
                                            {obj.cameraId}
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </Card>
    );
}
