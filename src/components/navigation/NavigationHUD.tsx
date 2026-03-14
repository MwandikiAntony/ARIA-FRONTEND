'use client';

import React from 'react';
import { HUDPanel } from './HUDPanel';
import { GPSWidget } from './GPSWidget';
import { DetectionLog } from './DetectionLog';
import { CameraFeed } from './CameraFeed';
import { ARIAVoiceCard } from './AriaVoiceCard';
import { RouteSteps } from './RouteSteps';
import { HapticPatterns } from './HapticPatterns';
import { QuickSOS } from './QuickSOS';
import { Tag } from '@/components/ui/Tag';
import type { AgentState } from '@/hooks/useAgentState';
import type { Environment } from '@/hooks/useGeolocation';
import type { DetectionResult } from '@/hooks/useNavigationSession';

interface NavigationHUDProps {
  agentState: AgentState;
  urgencyScore: number;
  isSpeaking: boolean;
  isListening: boolean;
  transcript: string;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  isCapturing: boolean;
  detections: DetectionResult[];
  environment: Environment;
  gpsAccuracy: number | null;
  position: GeolocationCoordinates | null;
  sessionId: string | null;
}

export const NavigationHUD: React.FC<NavigationHUDProps> = ({
  agentState,
  urgencyScore,
  isSpeaking,
  isListening,
  transcript,
  videoRef,
  isCapturing,
  detections,
  environment,
  gpsAccuracy,
  position,
  sessionId,
}) => {
  const gpsLocked = gpsAccuracy !== null && gpsAccuracy <= 20;
  const envColor = environment === 'indoor' ? 'amber' : 'cyan';
  const envTag =
    environment === 'indoor'  ? '● INDOOR MODE'  :
    environment === 'outdoor' ? '● OUTDOOR MODE' :
    '● DETECTING ENV…';

  const latLng = position
    ? `${position.latitude.toFixed(5)}, ${position.longitude.toFixed(5)}`
    : null;

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
          <Tag color={envColor}>{envTag}</Tag>
          {gpsLocked && <Tag color="green">GPS LOCKED</Tag>}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_280px] gap-4 lg:gap-5">

        <div className="flex flex-col gap-4">
          <HUDPanel title="Current Location">
            {position ? (
              <div className="flex flex-col gap-3">
                <div className="w-full h-36 rounded-lg overflow-hidden border border-border bg-bg-surface relative">
                  <iframe
                    title="Current Location Map"
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    src={`https://maps.google.com/maps?q=${position.latitude},${position.longitude}&z=16&output=embed`}
                    className="w-full h-full"
                  />
                  <div className="absolute top-1.5 left-1.5 bg-black/70 rounded px-1.5 py-0.5 font-mono text-[9px] text-cyan">
                    LIVE
                  </div>
                </div>
                <div className="font-mono text-[10px] text-text-muted break-all">{latLng}</div>
                <GPSWidget environment={environment} accuracy={gpsAccuracy} />
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <div className="w-full h-36 rounded-lg border border-border bg-bg-surface flex items-center justify-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-4 h-4 rounded-full border-2 border-cyan/30 border-t-cyan animate-spin" />
                    <span className="font-mono text-[10px] text-text-muted">Acquiring GPS…</span>
                  </div>
                </div>
                <GPSWidget environment={environment} accuracy={gpsAccuracy} />
              </div>
            )}
          </HUDPanel>

          <HUDPanel title="Object Detection">
            <DetectionLog detections={detections} />
          </HUDPanel>
        </div>

        <div className="flex flex-col gap-4">
          <CameraFeed
            videoRef={videoRef}
            isCapturing={isCapturing}
            detections={detections}
          />
          <ARIAVoiceCard isSpeaking={isSpeaking} transcript={transcript} />
        </div>

        <div className="flex flex-col gap-4">
          <HUDPanel title="Active Route">
            <RouteSteps />
          </HUDPanel>

          <HUDPanel title="Haptic Feedback">
            <HapticPatterns agentState={agentState} urgencyScore={urgencyScore} />
          </HUDPanel>

          <HUDPanel title="Emergency" className="border-red/30">
            <QuickSOS sessionId={sessionId} />
          </HUDPanel>
        </div>

      </div>
    </section>
  );
};