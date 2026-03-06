'use client';

import React, { useState } from 'react';
import { ModeCard } from './ModeCard';
import { Tag } from '@/components/ui/Tag';

export const HeroRight: React.FC = () => {
  const [activeMode, setActiveMode] = useState<'nav' | 'coach'>('nav');

  return (
    <div className="hidden lg:flex items-center justify-center px-16 xl:px-20 py-16 relative z-10 animate-slide-in-right animation-delay-200">
      <div className="w-full max-w-md">
        <div className="font-mono text-[11px] tracking-widest text-text-muted uppercase mb-1">
          // SELECT OPERATING MODE
        </div>

        <ModeCard
          type="nav"
          title="Navigation"
          description="Real-time outdoor & indoor guidance for the visually impaired. GPS routing, object detection, and emergency SOS."
          tags={['GPS', 'Object Detection', 'Voice Guide', 'SOS']}
          icon="🧭"
          isActive={activeMode === 'nav'}
          onSelect={() => setActiveMode('nav')}
        />

        <ModeCard
          type="coach"
          title="Coach"
          description="Live communication coaching for interviews, presentations & negotiations. Whisper hints at the perfect moment."
          tags={['Eye Contact', 'Pace', 'Filler Words', 'AI Insight']}
          icon="🎯"
          isActive={activeMode === 'coach'}
          onSelect={() => setActiveMode('coach')}
        />
      </div>
    </div>
  );
}; 
