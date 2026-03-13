'use client';

/**
 * src/components/assist/AssistLayout.tsx
 * Full dashboard layout: left (video + transcript) + right (sidebar).
 */

import React from 'react';
import { AssistVideoFeed } from '@/components/assist/AssistVideoFeed';
import { AssistTranscript } from '@/components/assist/AssistTranscript';
import { AssistSidebar } from '@/components/assist/AssistSidebar';
import { TaskShortcuts } from '@/components/assist/TaskShortcuts';
import type { AssistSessionState } from '@/hooks/useAssistSession';

interface AssistLayoutProps {
  session: AssistSessionState;
  videoRef: React.RefObject<HTMLVideoElement>;
  isSpeaking: boolean;
  onFlipCamera: () => void;
  onToggleCamera: () => void;
  onTakeScreenshot: () => void;
  onDownloadScreenshot: () => void;
  onDismissScreenshot: () => void;
  onToggleStep: (id: string) => void;
  onUpdateNotes: (notes: string) => void;
  onExport: () => void;
  onQuickTask: (query: string, label: string) => void;
}

export const AssistLayout: React.FC<AssistLayoutProps> = ({
  session,
  videoRef,
  isSpeaking,
  onFlipCamera,
  onToggleCamera,
  onTakeScreenshot,
  onDownloadScreenshot,
  onDismissScreenshot,
  onToggleStep,
  onUpdateNotes,
  onExport,
  onQuickTask,
}) => {
  return (
    <div className="flex gap-4 h-full">

      {/* Left column: video + transcript */}
      <div className="flex flex-col gap-4 flex-1 min-w-0">

        {/* Video feed */}
        <AssistVideoFeed
          videoRef={videoRef}
          phase={session.phase}
          isCameraOn={session.isCameraOn}
          cameraFacing={session.cameraFacing}
          hasMultipleCameras={session.hasMultipleCameras}
          isSpeaking={isSpeaking}
          taskTitle={session.taskTitle}
          screenshotDataUrl={session.screenshotDataUrl}
          onFlipCamera={onFlipCamera}
          onToggleCamera={onToggleCamera}
          onTakeScreenshot={onTakeScreenshot}
          onDownloadScreenshot={onDownloadScreenshot}
          onDismissScreenshot={onDismissScreenshot}
        />

        {/* Quick shortcuts strip (compact, below video) */}
        {(session.phase === 'active' || session.phase === 'paused') && (
          <div>
            <p className="text-[11px] text-white/25 uppercase tracking-widest font-mono mb-2">
              Quick Switch
            </p>
            <TaskShortcuts onSelect={onQuickTask} compact />
          </div>
        )}

        {/* Live transcript */}
        <AssistTranscript
          entries={session.transcript}
          isSpeaking={isSpeaking}
        />
      </div>

      {/* Right column: sidebar */}
      <div className="w-72 shrink-0 hidden lg:flex flex-col" style={{ minHeight: '600px' }}>
        <AssistSidebar
          steps={session.steps}
          timeline={session.timeline}
          sessionNotes={session.sessionNotes}
          sessionDuration={session.sessionDuration}
          taskTitle={session.taskTitle}
          onToggleStep={onToggleStep}
          onUpdateNotes={onUpdateNotes}
          onExport={onExport}
        />
      </div>

    </div>
  );
};
