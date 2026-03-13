// ── Coach Activity Modes ──────────────────────────────────────────────────────

export type CoachMode =
  | 'interview'
  | 'presentation'
  | 'music'
  | 'mc'
  | 'sermon'
  | 'negotiation';

export interface CoachModeConfig {
  id: CoachMode;
  label: string;
  icon: string;
  color: 'cyan' | 'amber' | 'green' | 'purple';
  description: string;
  coachFocus: string[];
  systemPromptHint: string;
}

// ── Metrics ───────────────────────────────────────────────────────────────────

export interface CoachMetrics {
  speakingRate: number;       // words per minute
  fillerWordCount: number;    // count this session
  eyeContactScore: number;    // 0–100
  confidenceScore: number;    // 0–100
  postureScore: number;       // 0–100
  energyScore: number;        // 0–100
  clarityScore: number;       // 0–100
  impactScore: number;        // 0–100
  pauseCount: number;         // number of strategic pauses
  volumeLevel: number;        // 0–100
}

export const DEFAULT_METRICS: CoachMetrics = {
  speakingRate: 0,
  fillerWordCount: 0,
  eyeContactScore: 0,
  confidenceScore: 0,
  postureScore: 0,
  energyScore: 0,
  clarityScore: 0,
  impactScore: 0,
  pauseCount: 0,
  volumeLevel: 0,
};

// ── Hint / Timeline Events ────────────────────────────────────────────────────

export type HintType = 'warn' | 'good' | 'info';
export type EventColor = 'amber' | 'green' | 'cyan' | 'red' | 'purple';

export interface HintEvent {
  id: string;
  time: string;          // formatted mm:ss
  message: string;
  type: string;          // e.g. "pace · urgency: medium"
  color: EventColor;
  hintType: HintType;
  timestamp: number;     // Date.now()
}

// ── Session State ─────────────────────────────────────────────────────────────

export type CoachSessionPhase =
  | 'idle'          // no mode selected yet
  | 'selecting'     // mode selector open
  | 'ready'         // mode selected, not started
  | 'active'        // session running
  | 'paused'        // session paused
  | 'ended';        // session complete

export interface CoachSessionState {
  phase: CoachSessionPhase;
  mode: CoachMode | null;
  sessionId: string | null;
  startTime: number | null;
  elapsedSeconds: number;
  metrics: CoachMetrics;
  events: HintEvent[];
  isMuted: boolean;
  isCameraOn: boolean;
  isMicOn: boolean;
}

// ── WebSocket message payloads (coach-specific) ───────────────────────────────

export interface CoachHintMessage {
  type: 'coach_hint';
  hint: string;
  hint_type: HintType;
  category: string;
  urgency: number;
  timestamp: number;
}

export interface CoachMetricsMessage {
  type: 'coach_metrics';
  metrics: Partial<CoachMetrics>;
  timestamp: number;
}

export interface CoachScoreMessage {
  type: 'coach_score';
  clarity: number;
  energy: number;
  impact: number;
  timestamp: number;
} 
