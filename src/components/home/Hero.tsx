'use client';

import React from 'react';
import { HeroLeft } from './HeroLeft';
import { HeroRight } from './HeroRight';

export const Hero: React.FC = () => {
  return (
    <section className="relative min-h-[calc(100vh-4rem)] grid grid-cols-1 lg:grid-cols-2 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_70%_50%,rgba(0,100,130,0.18)_0%,transparent_70%),radial-gradient(ellipse_40%_40%_at_20%_80%,rgba(0,229,255,0.07)_0%,transparent_60%),radial-gradient(ellipse_30%_30%_at_80%_10%,rgba(213,0,249,0.06)_0%,transparent_60%)]" />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(rgba(0,229,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,255,0.04) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
            maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 80%)',
          }}
        />
      </div>

      <HeroLeft />
      <HeroRight />
    </section>
  );
};