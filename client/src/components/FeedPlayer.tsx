import { useRef, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Maximize2, Loader2, AlertTriangle, Scan, MoreVertical, Signal, User, Car } from "lucide-react";
import { format } from "date-fns";

interface FeedPlayerProps {
  id: number;
  name: string;
  status: 'online' | 'offline' | 'maintenance';
  active?: boolean;
  videoUrl?: string; // Optional direct URL for simulation
}

export function FeedPlayer({ id, name, status, active, videoUrl }: FeedPlayerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Mock detections for demo
  // In a real app, these would come from the backend/WebSocket
  const detections = [
    { type: 'person', label: 'Person 98%', x: '20%', y: '30%', w: '10%', h: '25%', color: 'text-yellow-400 border-yellow-400' },
    { type: 'car', label: 'Vehicle 95%', x: '60%', y: '50%', w: '25%', h: '20%', color: 'text-blue-400 border-blue-400' },
  ];

  const containerRef = useRef<HTMLDivElement>(null);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative aspect-video bg-zinc-900 rounded-lg overflow-hidden border border-white/5 group hover:border-white/20 transition-all duration-300 shadow-xl",
        active && "ring-2 ring-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.2)]",
        isFullscreen && "ring-0 rounded-none border-none"
      )}>
      {/* Feed Content */}
      <div className="absolute inset-0 flex items-center justify-center bg-zinc-950">
        {status === 'online' ? (
          <div className="w-full h-full relative overflow-hidden group/feed">
            {videoUrl ? (
              // Check if image or video
              videoUrl.match(/\.(jpeg|jpg|gif|png)$/) != null || videoUrl.includes("images.unsplash.com") ? (
                <img src={videoUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover/feed:scale-105" alt="Live Feed" />
              ) : (
                <video src={videoUrl} autoPlay muted loop playsInline className="w-full h-full object-cover" />
              )
            ) : null}

            {/* Real-time Detection Overlays (Simulated) */}
            <div className="absolute inset-0 pointer-events-none">
              {detections.map((d, i) => (
                <div
                  key={i}
                  className={`absolute border-2 ${d.color.split(' ')[1]} opacity-0 group-hover/feed:opacity-100 transition-opacity duration-300`}
                  style={{ left: d.x, top: d.y, width: d.w, height: d.h }}
                >
                  <div className={`absolute -top-6 left-0 bg-black/70 px-2 py-0.5 text-[10px] uppercase font-bold ${d.color.split(' ')[0]}`}>
                    {d.label}
                  </div>
                  {/* Corner markers */}
                  <div className={`absolute -top-1 -left-1 w-2 h-2 border-t-2 border-l-2 ${d.color.split(' ')[1]}`} />
                  <div className={`absolute -bottom-1 -right-1 w-2 h-2 border-b-2 border-r-2 ${d.color.split(' ')[1]}`} />
                </div>
              ))}
            </div>

            {/* Smart HUD Overlay */}
            <div className="absolute inset-0 p-4 flex flex-col justify-between pointer-events-none">
              {/* Top Bar */}
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2 bg-black/50 backdrop-blur-md px-2 py-1 rounded border border-white/10">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-[10px] font-bold text-white uppercase tracking-wider">LIVE</span>
                </div>
                <div className="flex gap-2">
                  <div className="bg-black/50 backdrop-blur-md px-2 py-1 rounded border border-white/10 flex items-center gap-2">
                    <span className="text-[10px] font-mono text-white">{format(time, "HH:mm:ss")}</span>
                  </div>
                  <div className="bg-black/50 backdrop-blur-md px-2 py-1 rounded border border-white/10 flex items-center gap-2">
                    <Signal className="h-3 w-3 text-green-500" />
                    <span className="text-[10px] font-bold text-green-500">4K HH</span>
                  </div>
                </div>
              </div>

              {/* Bottom Bar */}
              <div className="flex justify-between items-end opacity-0 group-hover/feed:opacity-100 transition-opacity duration-300">
                <div className="bg-black/50 backdrop-blur-md p-2 rounded border border-white/10">
                  <p className="text-[10px] text-zinc-400 uppercase font-mono leading-none">CAM_{id.toString().padStart(2, '0')}</p>
                  <p className="text-sm font-bold text-white uppercase leading-none mt-1">MAIN_GATE_OPTICS</p>
                </div>
                <div className="pointer-events-auto">
                  <button
                    onClick={toggleFullscreen}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors text-white"
                  >
                    <Maximize2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-zinc-700">
            <AlertTriangle className="h-8 w-8 mb-2 opacity-50" />
            <span className="text-xs font-mono uppercase">SIGNAL_LOST</span>
          </div>
        )}
      </div>
    </div>
  );
}
