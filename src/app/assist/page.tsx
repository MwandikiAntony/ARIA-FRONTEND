'use client';

/**
 * src/app/assist/page.tsx
 *
 * LAYOUT (always):
 *   [ARIA bar — top, fixed]
 *   [Video feed — always visible]
 *   [Task shortcuts — visible until task selected, then hidden]
 *   [Transcript — below video, always]
 *   [Sidebar — right, lg+]
 *
 * STATES:
 *   idle    — ARIA on, video on, shortcuts visible, no task yet
 *   active  — task selected (click or voice), shortcuts hidden
 *   paused  — muted/paused
 *   ended   — show "Start again" button
 */

import React, { useEffect, useRef } from 'react';
import { useAssistSession } from '@/hooks/useAssistSession';
import { useAriaContext } from '@/contexts/AriaContext';
import { AssistAgentBar } from '@/components/assist/AssistAgentBar';
import { AssistVideoFeed } from '@/components/assist/AssistVideoFeed';
import { AssistTranscript } from '@/components/assist/AssistTranscript';
import { AssistSidebar } from '@/components/assist/AssistSidebar';
import { TaskShortcuts } from '@/components/assist/TaskShortcuts';

export default function AssistPage() {
  const { setPageFocus } = useAriaContext();

  const {
    session,
    videoRef,
    isSpeaking,
    ariaState,
    startSession,
    pauseSession,
    resumeSession,
    endSession,
    selectTask,
    toggleMute,
    toggleCamera,
    flipCamera,
    takeScreenshot,
    downloadScreenshot,
    toggleStep,
    updateSessionNotes,
    exportSession,
  } = useAssistSession();

  // Shift ARIA persona to Assist on mount
  useEffect(() => {
    setPageFocus('assist');
  }, [setPageFocus]);

  // Auto-start once WS is ready — only fires once, not on phase changes
  const startedRef = useRef(false);
  useEffect(() => {
    if (ariaState === 'ready' && !startedRef.current) {
      startedRef.current = true;
      startSession();
    }
  }, [ariaState]); // eslint-disable-line

  const transcriptText = session.transcript.length > 0
    ? session.transcript[session.transcript.length - 1]?.text ?? ''
    : '';

  // Shortcuts visible until a task is actively selected
  const showShortcuts = session.phase === 'idle' || session.phase === 'listening';
  const showEnded = session.phase === 'ended';

  return (
    <>
      {/* ARIA bar — always at top below navbar */}
      <AssistAgentBar
        phase={session.phase}
        taskTitle={session.taskTitle}
        sessionDuration={session.sessionDuration}
        isSpeaking={isSpeaking}
        isMuted={session.isMuted}
        transcript={transcriptText}
        onToggleMute={toggleMute}
        onPause={pauseSession}
        onResume={resumeSession}
        onEnd={endSession}
      />

      {/* Page content — padded below navbar (64px) + agent bar (48px) */}
      <div className="min-h-screen" style={{ background: '#070c07', paddingTop: '48px' }}>

        {/* ── Ended state ── */}
        {showEnded && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <p className="text-white/40 text-sm">Session ended</p>
            <button
              onClick={() => { startedRef.current = false; startSession(); }}
              className="px-8 py-3 rounded-2xl text-sm font-semibold transition-all hover:brightness-110 active:scale-95"
              style={{
                background: 'linear-gradient(135deg, rgba(52,211,153,0.25) 0%, rgba(16,185,129,0.2) 100%)',
                border: '1px solid rgba(52,211,153,0.3)',
                color: '#34d399',
              }}
            >
              Start again
            </button>
          </div>
        )}

        {/* ── Main layout (idle + active + paused) ── */}
        {!showEnded && (
          <div className="flex gap-4 px-4 py-4 max-w-7xl mx-auto">

            {/* Left column */}
            <div className="flex flex-col gap-4 flex-1 min-w-0">

              {/* Task shortcuts — shown until task selected */}
              {showShortcuts && (
                <div>
                  <p className="text-[11px] text-white/25 uppercase tracking-widest font-mono mb-3 text-center">
                    Say a task or pick one to begin
                  </p>
                  <TaskShortcuts onSelect={selectTask} />
                </div>
              )}

              {/* Video feed — always visible */}
              <AssistVideoFeed
                videoRef={videoRef}
                phase={session.phase}
                isCameraOn={session.isCameraOn}
                cameraFacing={session.cameraFacing}
                hasMultipleCameras={session.hasMultipleCameras}
                isSpeaking={isSpeaking}
                taskTitle={session.taskTitle}
                screenshotDataUrl={session.screenshotDataUrl}
                onFlipCamera={flipCamera}
                onToggleCamera={toggleCamera}
                onTakeScreenshot={takeScreenshot}
                onDownloadScreenshot={downloadScreenshot}
                onDismissScreenshot={() => {}}
              />

              {/* Transcript — always below video */}
              <AssistTranscript
                entries={session.transcript}
                isSpeaking={isSpeaking}
              />
            </div>

            {/* Right sidebar — lg+ */}
            <div className="w-72 shrink-0 hidden lg:flex flex-col" style={{ minHeight: '500px' }}>
              <AssistSidebar
                steps={session.steps}
                timeline={session.timeline}
                sessionNotes={session.sessionNotes}
                sessionDuration={session.sessionDuration}
                taskTitle={session.taskTitle}
                onToggleStep={toggleStep}
                onUpdateNotes={updateSessionNotes}
                onExport={exportSession}
              />
            </div>

          </div>
        )}
      </div>
    </>
  );
}