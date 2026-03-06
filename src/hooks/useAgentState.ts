 import { useState, useEffect, useCallback } from 'react'

export type AgentState = 'LISTENING' | 'OBSERVING' | 'EVALUATING' | 'COACHING' | 'SILENT'

interface UseAgentStateProps {
  onStateChange?: (state: AgentState) => void
  mode?: 'navigation' | 'coach'
}

export function useAgentState({ onStateChange, mode = 'navigation' }: UseAgentStateProps = {}) {
  const [currentState, setCurrentState] = useState<AgentState>('LISTENING')
  const [urgencyScore, setUrgencyScore] = useState(0)

  const transitionTo = useCallback((newState: AgentState) => {
    setCurrentState(newState)
    onStateChange?.(newState)
  }, [onStateChange])

  useEffect(() => {
    // Simulate state transitions based on mode
    const states: AgentState[] = ['LISTENING', 'OBSERVING', 'EVALUATING', 'COACHING', 'SILENT']
    let index = 0

    const interval = setInterval(() => {
      index = (index + 1) % states.length
      transitionTo(states[index])
      
      // Update urgency score based on state and mode
      if (states[index] === 'EVALUATING') {
        setUrgencyScore(0.7 + Math.random() * 0.25)
      } else if (states[index] === 'COACHING') {
        setUrgencyScore(0.9)
      } else {
        setUrgencyScore(Math.random() * 0.5)
      }
    }, mode === 'navigation' ? 3000 : 2500)

    return () => clearInterval(interval)
  }, [mode, transitionTo])

  return { currentState, urgencyScore, transitionTo }
}
