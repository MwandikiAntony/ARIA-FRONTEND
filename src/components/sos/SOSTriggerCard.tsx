import React from 'react';
import { SOSCircle } from './SOSCircle';
import { Tag } from '@/components/ui/Tag';

export const SOSTriggerCard: React.FC = () => {
  return (
    <div className="bg-gradient-to-br from-red/6 to-red/2 border border-red/30 rounded-2xl p-6 md:p-8 flex flex-col items-center gap-5 text-center">
      <SOSCircle />
      
      <div className="sos-label">Emergency Alert</div>
      
      <p className="text-xs text-text-muted leading-relaxed">
        Tap or say <strong className="text-red">&quot;Call emergency&quot;</strong>.<br />
        ARIA dispatches GPS location, calls contacts, and sends SMS alert instantly.
      </p>

      <div className="flex flex-col gap-2 w-full">
        <div className="flex items-center justify-between p-2 border border-red/20 border-l-3 border-l-red rounded-sm">
          <span className="text-[11px] text-text-primary">📍 GPS Dispatch</span>
          <Tag color="green" className="!text-[8px]">Ready</Tag>
        </div>
        <div className="flex items-center justify-between p-2 border border-red/20 border-l-3 border-l-red rounded-sm">
          <span className="text-[11px] text-text-primary">📱 SMS Alert</span>
          <Tag color="green" className="!text-[8px]">Ready</Tag>
        </div>
        <div className="flex items-center justify-between p-2 border border-red/20 border-l-3 border-l-red rounded-sm">
          <span className="text-[11px] text-text-primary">☁ Firestore Log</span>
          <Tag color="green" className="!text-[8px]">Ready</Tag>
        </div>
      </div>
    </div>
  );
}; 
