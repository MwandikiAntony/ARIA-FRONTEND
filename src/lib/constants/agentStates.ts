import { AgentStateConfig } from '../types/agent.types'

export const AGENT_STATES: AgentStateConfig[] = [
  {
    name: 'LISTENING',
    label: 'Listening',
    color: 'cyan',
    description: 'Mic streams to Gemini Live. Full audio captured.'
  },
  {
    name: 'OBSERVING',
    label: 'Observing',
    color: 'amber',
    description: 'Camera frames + GPS polled. Building live environmental context.'
  },
  {
    name: 'EVALUATING',
    label: 'Evaluating',
    color: 'purple',
    description: 'Weighing detection confidence, urgency, and user context.'
  },
  {
    name: 'COACHING',
    label: 'Coaching',
    color: 'green',
    description: 'Delivering real-time guidance and alerts.'
  },
  {
    name: 'SILENT',
    label: 'Silent Watch',
    color: 'text-muted',
    description: 'Observing without speaking. Accumulating pattern data.'
  }
]
