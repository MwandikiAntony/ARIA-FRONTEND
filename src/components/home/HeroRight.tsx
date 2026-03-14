'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ModeCard } from './ModeCard';

export const HeroRight: React.FC = () => {
  const router = useRouter();
  const [activeMode, setActiveMode] = useState<'assist' | 'nav' | 'coach'>('assist');

  const handleSelect = (mode: 'assist' | 'nav' | 'coach') => {
    setActiveMode(mode);
    setTimeout(() => {
      if (mode === 'assist') router.push('/assist');
      if (mode === 'nav')    router.push('/navigate?autostart=true');
      if (mode === 'coach')  router.push('/coach');
    }, 300);
  };

  return (
    <div className="hidden lg:flex items-center justify-center px-16 xl:px-20 py-16 relative z-10 animate-slide-in-right animation-delay-200">
      <div className="w-full max-w-md">
        <div className="font-mono text-[11px] tracking-widest text-text-muted uppercase mb-4">
          // SELECT OPERATING MODE
        </div>

        {/* General Assistant — Option 1 */}
        <ModeCard
          type="assist"
          title="General Assistant"
          description="Everyday AI help — homework, quick questions, cooking, repairs. Point your camera and ask anything."
          tags={['Live Camera', 'Voice', 'Any Task', 'Hands-Free']}
          icon="✦"
          isActive={activeMode === 'assist'}
          onSelect={() => handleSelect('assist')}
        />

        {/* Navigation — Option 2 */}
        <ModeCard
          type="nav"
          title="Navigation"
          description="Real-time outdoor & indoor guidance for the visually impaired. GPS routing, object detection, and emergency SOS."
          tags={['GPS', 'Object Detection', 'Voice Guide', 'SOS']}
          icon="🧭"
          isActive={activeMode === 'nav'}
          onSelect={() => handleSelect('nav')}
        />

        {/* Coach — Option 3 */}
        <ModeCard
          type="coach"
          title="Coach"
          description="Live communication coaching for interviews, presentations & negotiations. Whisper hints at the perfect moment."
          tags={['Eye Contact', 'Pace', 'Filler Words', 'AI Insight']}
          icon="🎯"
          isActive={activeMode === 'coach'}
          onSelect={() => handleSelect('coach')}
        />
      </div>
    </div>
  );
};