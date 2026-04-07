'use client';

import React, { useState } from 'react';
import { ModeCard } from '@/components/home/ModeCard';
import { type User, useAuth } from '@/contexts/AuthContext'; 
import { useRouter } from 'next/navigation';

interface ModeSelectorProps {
  user: User | null;
  router: ReturnType<typeof useRouter>;
}


export default function ModeSelector({ user, router }: ModeSelectorProps) {
  const [activeMode, setActiveMode] = useState<'nav' | 'coach' | 'assist' | null>(null);

  const handleSelect = (mode: 'nav' | 'coach' | 'assist') => {
    if (!user) return; // prevent selection if not registered

    setActiveMode(mode);
    setTimeout(() => {
      if (mode === 'nav') router.push('/navigate?autostart=true');
      if (mode === 'coach') router.push('/coach');
      if (mode === 'assist') router.push('/assist');
    }, 300);
  };

  return (
    <section className="py-16 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <p className="font-mono text-xs tracking-widest uppercase text-text-secondary/60">
            Choose your mode
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <ModeCard
            type="assist"
            title="General Assistant"
            description="Everyday AI help — homework, quick questions, cooking, repairs. Point your camera and ask anything."
            tags={['Live Camera', 'Voice', 'Any Task', 'Hands-Free']}
            icon="✦"
            isActive={activeMode === 'assist'}
            isLocked={!user} // lock if user not registered
            onSelect={() => handleSelect('assist')}
          />

          <ModeCard
            type="nav"
            title="Navigate"
            description="AI-powered eyes for the world. Real-time obstacle detection, turn-by-turn guidance, and safety alerts."
            tags={['Live Camera', 'GPS', 'Voice', 'SOS']}
            icon="◉"
            isActive={activeMode === 'nav'}
            isLocked={!user}
            onSelect={() => handleSelect('nav')}
          />

          <ModeCard
            type="coach"
            title="Coach"
            description="Real-time communication coaching. ARIA watches, listens, and whispers the right hint at the right moment."
            tags={['Interview', 'Presentation', 'Pitch', 'AI Insight']}
            icon="◈"
            isActive={activeMode === 'coach'}
            isLocked={!user}
            onSelect={() => handleSelect('coach')}
          />
        </div>
      </div>
    </section>
  );
}