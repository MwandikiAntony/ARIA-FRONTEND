// Agent Types
export type AgentState = 'LISTENING' | 'OBSERVING' | 'EVALUATING' | 'COACHING' | 'SILENT_WATCH';

export interface AgentStateInfo {
  state: AgentState;
  number: number;
  color: string;
}

// Navigation Types
export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Detection {
  id: string;
  name: string;
  confidence: number;
  type: 'vehicle' | 'pedestrian' | 'traffic_light' | 'door' | 'crosswalk' | 'obstacle';
  severity: 'high' | 'mid' | 'low';
  position?: {
    top: number;
    left: number;
    width: number;
    height: number;
  };
}

export interface RouteStep {
  id: string;
  instruction: string;
  distance: number;
  icon: string;
  isCurrent?: boolean;
}

// Coach Types
export interface CoachingMetric {
  label: string;
  value: number;
  unit: string;
  delta?: number;
  color: 'cyan' | 'amber' | 'green' | 'purple';
}

export interface CoachingHint {
  id: string;
  message: string;
  subtext: string;
  type: 'warn' | 'good' | 'info';
  timestamp: number;
}

export interface TimelineEvent {
  id: string;
  time: string;
  message: string;
  type: string;
  color: 'amber' | 'green' | 'cyan' | 'red';
}

// WebSocket Types
export interface WSMessage {
  type: 'audio' | 'video' | 'detection' | 'state' | 'sos' | 'coaching';
  payload: any;
  timestamp: number;
  sessionId: string;
}

// Settings Types
export interface Settings {
  voiceActive: boolean;
  bargeIn: boolean;
  hapticFeedback: boolean;
  autoModeSwitch: boolean;
  indoorDetection: boolean;
  whisperHints: boolean;
  earpieceMode: boolean;
  timingIntelligence: boolean;
  sessionRecording: boolean;
  postSessionDebrief: boolean;
}

// SOS Types
export interface EmergencyContact {
  id: string;
  name: string;
  role: string;
  avatar: string;
  status: 'active' | 'standby';
  color: string;
}

export interface SOSEvent {
  id: string;
  type: 'test' | 'system' | 'real';
  message: string;
  timestamp: string;
  location?: Coordinates;
}