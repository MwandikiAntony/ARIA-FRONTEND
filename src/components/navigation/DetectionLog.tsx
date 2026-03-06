import React from 'react';
import { Detection } from '@/types';

const detections: Detection[] = [
  { id: '1', name: 'Vehicle', confidence: 0.94, type: 'vehicle', severity: 'high' },
  { id: '2', name: 'Pedestrian', confidence: 0.87, type: 'pedestrian', severity: 'mid' },
  { id: '3', name: 'Traffic Light', confidence: 0.79, type: 'traffic_light', severity: 'low' },
  { id: '4', name: 'Door', confidence: 0.71, type: 'door', severity: 'low' },
  { id: '5', name: 'Crosswalk', confidence: 0.85, type: 'crosswalk', severity: 'mid' },
];

export const DetectionLog: React.FC = () => {
  return (
    <div className="flex flex-col gap-1 max-h-[200px] overflow-y-auto">
      {detections.map((detection) => (
        <div
          key={detection.id}
          className={`
            flex items-center justify-between p-1.5 bg-bg-surface rounded-sm font-mono text-[10px]
            animate-slide-in-right border-l-2
            ${detection.severity === 'high' ? 'border-l-red' : ''}
            ${detection.severity === 'mid' ? 'border-l-amber' : ''}
            ${detection.severity === 'low' ? 'border-l-text-muted' : ''}
          `}
        >
          <span className="text-text-primary">{detection.name}</span>
          <span className="text-text-muted">{detection.confidence.toFixed(2)}</span>
        </div>
      ))}
    </div>
  );
}; 
