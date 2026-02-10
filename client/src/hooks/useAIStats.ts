import { useState, useEffect, useRef, useCallback } from 'react';

interface Detection {
    id: string;
    class: string;
    confidence: number;
    threat_level: 'normal' | 'suspicious' | 'critical';
    bbox_normalized?: number[];
}

interface Alert {
    id: string;
    title: string;
    description: string;
    severity: string;
    timestamp: string;
}

interface AIStats {
    totalDetections: number;
    criticalAlerts: number;
    currentDetections: Detection[];
    recentAlerts: Alert[];
    isConnected: boolean;
    fps: number;
}

export function useAIStats() {
    const [stats, setStats] = useState<AIStats>({
        totalDetections: 0,
        criticalAlerts: 0,
        currentDetections: [],
        recentAlerts: [],
        isConnected: false,
        fps: 0
    });

    const wsRef = useRef<WebSocket | null>(null);
    const detectionCountRef = useRef(0);
    const alertCountRef = useRef(0);
    const alertsRef = useRef<Alert[]>([]);
    const lastAlertTimeRef = useRef<{ [key: string]: number }>({});

    useEffect(() => {
        const connect = () => {
            const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            const ws = new WebSocket(`${protocol}//${window.location.hostname}:8000/api/ai/stream`);

            ws.onopen = () => {
                setStats(prev => ({ ...prev, isConnected: true }));
            };

            ws.onmessage = (event) => {
                const data = JSON.parse(event.data);

                if (data.type === 'frame_analysis') {
                    const detections = data.detections || [];

                    // Count unique detections (only when count increases or new objects detected)
                    // Use a simple heuristic: count new critical/suspicious detections only
                    const newThreats = detections.filter((d: any) =>
                        d.threat_level === 'critical' || d.threat_level === 'suspicious'
                    );

                    if (newThreats.length > 0) {
                        // Only increment when there are actual threats, not for normal detections
                        detectionCountRef.current += 1;
                    }

                    // Get FPS from fusion data
                    const fps = data.fusion?.fps || 0;

                    setStats(prev => ({
                        ...prev,
                        totalDetections: detectionCountRef.current,
                        currentDetections: detections,
                        fps
                    }));
                }

                if (data.type === 'critical_alert') {
                    const alert = data.alert;
                    const alertKey = alert.title || alert.message;
                    const now = Date.now();

                    // Deduplicate: Only add if same alert wasn't shown in last 10 seconds
                    if (!lastAlertTimeRef.current[alertKey] || now - lastAlertTimeRef.current[alertKey] > 10000) {
                        lastAlertTimeRef.current[alertKey] = now;
                        alertCountRef.current += 1;

                        const newAlert: Alert = {
                            id: `alert_${now}`,
                            title: alert.title || 'Critical Alert',
                            description: alert.message || alert.description || '',
                            severity: 'critical',
                            timestamp: new Date().toISOString()
                        };

                        alertsRef.current = [newAlert, ...alertsRef.current].slice(0, 10); // Keep last 10

                        setStats(prev => ({
                            ...prev,
                            criticalAlerts: alertCountRef.current,
                            recentAlerts: alertsRef.current
                        }));
                    }
                }
            };

            ws.onerror = () => {
                setStats(prev => ({ ...prev, isConnected: false }));
            };

            ws.onclose = () => {
                setStats(prev => ({ ...prev, isConnected: false }));
                // Reconnect after 2 seconds
                setTimeout(connect, 2000);
            };

            wsRef.current = ws;
        };

        connect();

        return () => {
            if (wsRef.current) {
                wsRef.current.close();
            }
        };
    }, []);

    const clearAlerts = useCallback(() => {
        alertsRef.current = [];
        alertCountRef.current = 0;
        setStats(prev => ({ ...prev, criticalAlerts: 0, recentAlerts: [] }));
    }, []);

    return { ...stats, clearAlerts };
}
