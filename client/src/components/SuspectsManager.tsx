import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Trash2, Camera, Shield, UserPlus } from 'lucide-react';
import { cn } from '@/lib/utils'; // Assuming utils exist

interface SuspectsManagerProps {
    isOpen: boolean;
    onClose: () => void;
}

export function SuspectsManager({ isOpen, onClose }: SuspectsManagerProps) {
    const [suspects, setSuspects] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Fetch suspects on mount/open
    useState(() => {
        if (isOpen) fetchSuspects();
    });

    async function fetchSuspects() {
        try {
            const res = await fetch(`http://${window.location.hostname}:8000/api/suspects`);
            const data = await res.json();
            setSuspects(data.suspects || []);
        } catch (e) {
            console.error("Failed to load suspects", e);
        }
    }

    async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
        if (!e.target.files?.length) return;
        setLoading(true);
        const file = e.target.files[0];
        const formData = new FormData();
        formData.append('file', file);

        try {
            await fetch(`http://${window.location.hostname}:8000/api/suspects`, {
                method: 'POST',
                body: formData
            });
            await fetchSuspects();
        } catch (e) {
            console.error("Upload failed", e);
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete(filename: string) {
        if (!confirm(`Remove ${filename} from database?`)) return;
        try {
            await fetch(`http://${window.location.hostname}:8000/api/suspects/${filename}`, {
                method: 'DELETE'
            });
            await fetchSuspects();
        } catch (e) {
            console.error("Delete failed", e);
        }
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="w-full max-w-2xl bg-black border border-red-500/30 rounded-xl overflow-hidden shadow-[0_0_50px_rgba(239,68,68,0.2)]"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-red-950/20">
                            <div className="flex items-center gap-3">
                                <Shield className="w-6 h-6 text-red-500" />
                                <div>
                                    <h2 className="text-xl font-black text-white uppercase tracking-wider">Target Database</h2>
                                    <p className="text-xs text-red-400 font-mono">HIGH VALUE TARGETS // FACIAL RECOGNITION</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                <X className="w-5 h-5 text-zinc-400" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            {/* Upload Area */}
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="border-2 border-dashed border-white/10 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-red-500/50 hover:bg-red-500/5 transition-all group mb-8"
                            >
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleUpload}
                                />
                                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                    <UserPlus className="w-6 h-6 text-zinc-400 group-hover:text-red-400" />
                                </div>
                                <p className="text-sm font-bold text-zinc-300">ADD NEW TARGET</p>
                                <p className="text-xs text-zinc-500 mt-1">Upload clear facial image (JPG/PNG)</p>
                            </div>

                            {/* Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                {suspects.map((suspect) => (
                                    <div key={suspect} className="relative group aspect-square bg-zinc-900 rounded-lg overflow-hidden border border-white/10 hover:border-red-500/50 transition-colors">
                                        <img
                                            src={`http://${window.location.hostname}:8000/api/suspects/image/${suspect}`}
                                            // Actually, for simplicity, let's just use a placeholder icon or try to serve them?
                                            // Since we didn't add a static mount, let's assume valid names are just displayed text or we add a static mount.
                                            // Let's just create a new endpoint for serving images or use a placeholder.
                                            // I'll add a static mount in main.py in next step. For now assume it works.
                                            className="w-full h-full object-cover opacity-50 group-hover:opacity-100 transition-opacity grayscale group-hover:grayscale-0"
                                            onError={(e) => e.currentTarget.src = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT7728yba0t0dF0wS-J7YxP3Q57y5W72c0-8A&s"} // Fallback
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />

                                        <div className="absolute bottom-3 left-3 right-3">
                                            <p className="text-[10px] font-black text-white truncate uppercase">
                                                {suspect.split('.')[0].replace(/_/g, ' ')}
                                            </p>
                                        </div>

                                        <button
                                            onClick={() => handleDelete(suspect)}
                                            className="absolute top-2 right-2 p-1.5 bg-red-500/20 hover:bg-red-500 rounded text-red-500 hover:text-white opacity-0 group-hover:opacity-100 transition-all"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                                {suspects.length === 0 && (
                                    <div className="col-span-full py-8 text-center text-zinc-600 font-mono text-xs">
                                        NO ACTIVE TARGETS IN DATABASE
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
