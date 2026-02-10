import { useEffect } from 'react';
import { Circle, Popup } from 'react-leaflet';

interface PredictiveThreatsProps {
    predictions: any[];
}

export function PredictiveThreats({ predictions }: PredictiveThreatsProps) {
    if (!predictions) return null;

    return (
        <>
            {predictions.map((pred, i) => (
                <Circle
                    key={i}
                    center={[pred.coordinates.lat, pred.coordinates.lng]}
                    radius={150} // 150m radius
                    pathOptions={{
                        color: 'transparent',
                        fillColor: '#a855f7', // Purple for predictive/AI
                        fillOpacity: pred.risk_score * 0.5, // Opacity based on risk
                    }}
                >
                    <Popup className="custom-popup">
                        <div className="p-2 font-mono">
                            <div className="text-xs font-black text-purple-600 uppercase mb-1">
                                AI PREDICTION
                            </div>
                            <div className="text-[10px]">
                                <div>Risk: <span className="font-bold">{(pred.risk_score * 100).toFixed(0)}%</span></div>
                                <div>Type: <span className="font-bold">{pred.likely_threat}</span></div>
                                <div>Window: <span className="font-bold">{pred.prediction_window}</span></div>
                            </div>
                        </div>
                    </Popup>
                </Circle>
            ))}
        </>
    );
}
