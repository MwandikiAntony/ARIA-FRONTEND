'use client';

import React, { useState, useEffect } from 'react';
import { HUDPanel } from './HUDPanel';
import { AgentStateIndicator } from './AgentStateIndicator';
import { GPSWidget } from './GPSWidget';
import { DetectionLog } from './DetectionLog';
import { CameraFeed } from './CameraFeed';
import { ARIAVoiceCard } from './AriaVoiceCard';
import { RouteSteps } from './RouteSteps';
import { HapticPatterns } from './HapticPatterns';
import { QuickSOS } from './QuickSOS';
import { Tag } from '@/components/ui/Tag';
import { Button } from '@/components/ui/Button';

export const NavigationHUD: React.FC = () => {
  const [currentState, setCurrentState] = useState(2);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentState((prev) => (prev + 1) % 5);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="bg-bg-deep border-t border-border px-4 md:px-8 py-12 md:py-16">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8 md:mb-10">
        <div>
          <div className="section-label">Navigation Mode</div>
          <h2 className="section-title">
            Live <span className="text-cyan">Navigation</span> HUD
          </h2>
        </div>
        <div className="flex flex-wrap gap-2.5 items-center">
          <Tag color="cyan">● OUTDOOR MODE</Tag>
          <Tag color="green">GPS LOCKED</Tag>
          <Button variant="ghost" className="!px-4 !py-2 !text-xs">
            ⚙ Settings
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_280px] gap-4 lg:gap-5">
        {/* Left Panel */}
        <div className="flex flex-col gap-4">
          <HUDPanel title="// Agent State">
            <AgentStateIndicator currentState={currentState} />
          </HUDPanel>

          <HUDPanel title="// GPS Signal">
            <GPSWidget />
          </HUDPanel>

          <HUDPanel title="// Object Detection">
            <DetectionLog />
          </HUDPanel>
        </div>

        {/* Center Panel */}
        <div className="flex flex-col gap-4">
          <CameraFeed />
          <ARIAVoiceCard />
        </div>

        {/* Right Panel */}
        <div className="flex flex-col gap-4">
          <HUDPanel title="// Active Route">
            <RouteSteps />
          </HUDPanel>

          <HUDPanel title="// Haptic Feedback">
            <HapticPatterns />
          </HUDPanel>

          <HUDPanel title="// Emergency" className="border-red/30">
            <QuickSOS />
          </HUDPanel>
        </div>
      </div>
    </section>
  );
};