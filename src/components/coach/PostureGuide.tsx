/**
 * PostureGuide.tsx — UPDATED
 *
 * WHAT CHANGED:
 * Previously hardcoded values (82, 65, 90). Now accepts real score props
 * from CoachingOverlay which gets them from useCoachSession metrics.
 * Falls back to 0 when session hasn't started so bars start at zero.
 */

import React from 'react';

interface PostureGuideProps {
  postureScore: number;    // 0–100
  energyScore: number;     // 0–100
  eyeContactScore: number; // 0–100
}

export const PostureGuide: React.FC<PostureGuideProps> = ({
  postureScore,
  energyScore,
  eyeContactScore,
}) => {
  const guides = [
    { label: 'POSTURE', value: postureScore || 0, color: 'green' },
    { label: 'ENERGY',  value: energyScore  || 0, color: 'amber' },
    { label: 'EYE',     value: eyeContactScore || 0, color: 'cyan' },
  ];

  return (
    <div className="absolute bottom-16 left-4 md:left-5 flex gap-2">
      {guides.map((guide) => (
        <div key={guide.label} className="flex flex-col items-center gap-1">
          <div className="w-1 h-16 bg-white/10 rounded-sm relative overflow-hidden">
            <div
              className="absolute bottom-0 left-0 right-0 rounded-sm transition-all duration-700"
              style={{
                height: `${guide.value}%`,
                backgroundColor: `var(--color-${guide.color})`,
              }}
            />
          </div>
          <span className="font-mono text-[8px] text-text-muted vertical-rl rotate-180 tracking-wider">
            {guide.label}
          </span>
        </div>
      ))}
    </div>
  );
};