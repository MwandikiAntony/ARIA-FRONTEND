export type AgentState = 'LISTENING' | 'OBSERVING' | 'EVALUATING' | 'COACHING' | 'SILENT'

export interface AgentStateConfig {
  name: AgentState
  label: string
  color: string
  description: string
}

export interface AgentContext {
  mode: 'navigation' | 'coach'
  timestamp: number
  sessionId: string
  urgencyScore: number
  lastAlertTime?: number
  confidence: number
}

export interface AgentDecision {
  shouldAct: boolean
  action?: 'alert' | 'coach' | 'silent'
  message?: string
  confidence: number
  urgency: number
} 
