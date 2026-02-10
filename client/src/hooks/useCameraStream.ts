import { useState, useEffect, useRef } from 'react';

export interface Detection {
    id: string;
    class: string;
    confidence: number;
    bbox: { x: number; y: number; width: number; height: number };
    bbox_normalized?: number[];
    threat_level: 'normal' | 'suspicious' | 'critical';
    timestamp: string;
}

interface UseCameraStreamResult {
    detections: Detection[];
    isConnected: boolean;
    fps: number;
    alerts?: any[];
}

export function useCameraStream(cameraId: string, isLive: boolean = true): UseCameraStreamResult {
    const [detections, setDetections] = useState<Detection[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const [fps, setFps] = useState(0);
    const wsRef = useRef<WebSocket | null>(null);
    const [alerts, setAlerts] = useState<any[]>([]);
    const lastAlertTimeRef = useRef<{ [key: string]: number }>({});

    useEffect(() => {
        if (!isLive) return;

        const connectWebSocket = () => {
            const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            const ws = new WebSocket(`${protocol}//${window.location.hostname}:8000/api/ai/stream`);

            ws.onopen = () => {
                setIsConnected(true);
            };

            let lastUpdate = 0;
            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    const now = Date.now();

                    if (data.type === 'frame_analysis' && now - lastUpdate > 50) {
                        setDetections(data.detections || []);
                        if (data.fusion?.fps) setFps(data.fusion.fps);
                        lastUpdate = now;
                    } else if (data.type === 'critical_alert') {
                        // Deduplication logic using unique detection ID or fallback
                        const alert = data.alert;
                        const alertKey = alert.detection_id || `${alert.type}-${alert.object}`;
                        const lastTime = lastAlertTimeRef.current[alertKey] || 0;

                        // Only show alert if we haven't seen this SPECIFIC threat instance in the last 60 seconds
                        if (now - lastTime > 60000) {
                            setAlerts(prev => [data.alert, ...prev].slice(0, 10)); // Keep last 10
                            lastAlertTimeRef.current[alertKey] = now;

                            // Dispatch custom event for other components (like AlertsWidget)
                            window.dispatchEvent(new CustomEvent('new-alert', { detail: data.alert }));
                        }
                    }
                } catch (e) {
                    console.error("Error parsing WebSocket message:", e);
                }
            };

            ws.onerror = () => {
                setIsConnected(false);
            };

            ws.onclose = () => {
                setIsConnected(false);
                setTimeout(connectWebSocket, 2000);
            };

            wsRef.current = ws;
        };

        connectWebSocket();

        return () => {
            if (wsRef.current) {
                wsRef.current.close();
            }
        };
    }, [isLive, cameraId]);

    return { detections, isConnected, fps, alerts };
}
