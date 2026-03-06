import React from 'react';
import { Waveform } from '@/components/ui/Waveform';
import { Tag } from '@/components/ui/Tag';

export const ARIAVoiceCard: React.FC = () => {
  return (
    <div className="bg-gradient-to-br from-cyan/6 to-transparent border border-cyan/20 rounded-md p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="font-display text-base font-bold text-cyan tracking-wider">⬡ ARIA</div>
        <Waveform />
        <Tag color="cyan">SPEAKING</Tag>
      </div>
      <p className="text-sm leading-relaxed text-text-secondary italic">
        &quot;Vehicle approaching from the left. Please wait at the curb. The crosswalk light is red. I&apos;ll
        let you know when it&apos;s safe to cross.&quot;
      </p>
    </div>
  );
}; 
