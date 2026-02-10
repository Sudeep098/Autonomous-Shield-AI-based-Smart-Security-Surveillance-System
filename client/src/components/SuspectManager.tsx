import { useState, useEffect, useRef } from 'react';
import { Upload, X, UserPlus, Trash2, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SuspectManagerProps {
    isOpen: boolean;
    onClose: () => void;
}

export function SuspectManager({ isOpen, onClose }: SuspectManagerProps) {
    const [suspects, setSuspects] = useState<string[]>([]);
    const [uploading, setUploading] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Fetch existing suspects
    useEffect(() => {
        fetchSuspects();
    }, [isOpen]);

    const fetchSuspects = async () => {
        try {
            const res = await fetch(`http://${window.location.hostname}:8000/api/suspects`);
            const data = await res.json();
            setSuspects(data.suspects || []);
        } catch (err) {
            console.error('Failed to fetch suspects:', err);
        }
    };

    const handleUpload = async (file: File) => {
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch(`http://${window.location.hostname}:8000/api/suspects`, {
                method: 'POST',
                body: formData
            });

            if (res.ok) {
                await fetchSuspects();
            }
        } catch (err) {
            console.error('Upload failed:', err);
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (filename: string) => {
        try {
            await fetch(`http://${window.location.hostname}:8000/api/suspects/${filename}`, {
                method: 'DELETE'
            });
            await fetchSuspects();
        } catch (err) {
            console.error('Delete failed:', err);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            handleUpload(file);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleUpload(file);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-neutral-900 border border-cyan-500/30 rounded-xl w-[500px] max-h-[80vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-red-500/20 border border-red-500/30 flex items-center justify-center">
                            <AlertTriangle className="w-5 h-5 text-red-500" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white">Suspect Database</h2>
                            <p className="text-[10px] text-zinc-500 font-mono">FACE RECOGNITION TARGETS</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                        <X className="w-5 h-5 text-zinc-400" />
                    </button>
                </div>

                {/* Upload Zone */}
                <div className="p-4">
                    <div
                        className={cn(
                            "border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer",
                            dragOver ? "border-cyan-500 bg-cyan-500/10" : "border-white/20 hover:border-cyan-500/50"
                        )}
                        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileSelect}
                        />
                        <Upload className={cn("w-8 h-8 mx-auto mb-2", dragOver ? "text-cyan-500" : "text-zinc-600")} />
                        <p className="text-sm text-zinc-400">
                            {uploading ? 'Uploading...' : 'Drag & drop suspect image or click to browse'}
                        </p>
                        <p className="text-[10px] text-zinc-600 mt-1">JPG, PNG supported</p>
                    </div>
                </div>

                {/* Suspects List */}
                <div className="px-4 pb-4 max-h-[300px] overflow-y-auto">
                    <div className="text-[10px] text-zinc-500 font-mono mb-2">
                        REGISTERED SUSPECTS ({suspects.length})
                    </div>

                    {suspects.length === 0 ? (
                        <div className="text-center py-8 text-zinc-600">
                            <UserPlus className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No suspects registered</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-3 gap-3">
                            {suspects.map((filename) => (
                                <div key={filename} className="relative group">
                                    <img
                                        src={`http://${window.location.hostname}:8000/api/suspects/image/${filename}`}
                                        alt={filename}
                                        className="w-full aspect-square object-cover rounded-lg border border-white/10"
                                    />
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                                        <button
                                            onClick={() => handleDelete(filename)}
                                            className="p-2 bg-red-500/20 border border-red-500/50 rounded-lg hover:bg-red-500/40 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4 text-red-400" />
                                        </button>
                                    </div>
                                    <div className="absolute bottom-0 left-0 right-0 bg-black/80 p-1 rounded-b-lg">
                                        <p className="text-[9px] text-white truncate text-center">
                                            {filename.replace(/\.[^/.]+$/, '').replace(/_/g, ' ')}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-white/10 bg-black/50">
                    <p className="text-[10px] text-zinc-500 text-center">
                        Uploaded faces are matched in real-time using InsightFace AI
                    </p>
                </div>
            </div>
        </div>
    );
}
