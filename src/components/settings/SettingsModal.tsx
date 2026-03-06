'use client';

import React, { useEffect } from 'react';
import { SettingsGroup } from './SettingsGroup';
import { SettingRow } from './SettingRow';
import { useSettings } from '@/contexts/SettingsContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'navigation' | 'coach';
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, mode }) => {
  const { settings, updateSetting } = useSettings();

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg">
        <div className="modal-overlay">
          <div className="modal-header">
            <h3 className="modal-title">
              {mode === 'navigation' ? 'Navigation' : 'Coach'} Settings
            </h3>
            <button 
              className="modal-close" 
              onClick={onClose}
              aria-label="Close"
            >
              ✕
            </button>
          </div>
          
          <div className="modal-body max-h-[70vh] overflow-y-auto">
            {mode === 'navigation' ? (
              <>
                <SettingsGroup title="// Voice Agent">
                  <SettingRow
                    name="ARIA Voice Active"
                    description="Enable real-time voice guidance via Gemini Live"
                    checked={settings.voiceActive}
                    onChange={(checked) => updateSetting('voiceActive', checked)}
                  />
                  <SettingRow
                    name="Barge-in Interruption"
                    description="Allow user to speak over ARIA mid-sentence"
                    checked={settings.bargeIn}
                    onChange={(checked) => updateSetting('bargeIn', checked)}
                  />
                  <SettingRow
                    name="Haptic Feedback"
                    description="Vibration patterns for stop, turn, obstacle"
                    checked={settings.hapticFeedback}
                    onChange={(checked) => updateSetting('hapticFeedback', checked)}
                  />
                </SettingsGroup>

                <SettingsGroup title="// Detection">
                  <SettingRow
                    name="Auto Mode Switch"
                    description="Auto-detect outdoor vs indoor context"
                    checked={settings.autoModeSwitch}
                    onChange={(checked) => updateSetting('autoModeSwitch', checked)}
                  />
                  <SettingRow
                    name="Indoor Object Detection"
                    description="TFLite SSD — doors, stairs, switches"
                    checked={settings.indoorDetection}
                    onChange={(checked) => updateSetting('indoorDetection', checked)}
                  />
                </SettingsGroup>
              </>
            ) : (
              <>
                <SettingsGroup title="// Feedback Control" titleColor="amber">
                  <SettingRow
                    name="Whisper Hints"
                    description="Real-time overlay coaching during session"
                    checked={settings.whisperHints}
                    onChange={(checked) => updateSetting('whisperHints', checked)}
                  />
                  <SettingRow
                    name="Audio Earpiece Mode"
                    description="TTS coaching via Web Speech API"
                    checked={settings.earpieceMode}
                    onChange={(checked) => updateSetting('earpieceMode', checked)}
                  />
                  <SettingRow
                    name="Timing Intelligence"
                    description="Suppress hints during high-stakes moments"
                    checked={settings.timingIntelligence}
                    onChange={(checked) => updateSetting('timingIntelligence', checked)}
                  />
                </SettingsGroup>

                <SettingsGroup title="// Analytics" titleColor="amber">
                  <SettingRow
                    name="Session Recording"
                    description="Save session data to Firestore for review"
                    checked={settings.sessionRecording}
                    onChange={(checked) => updateSetting('sessionRecording', checked)}
                  />
                  <SettingRow
                    name="Post-Session Debrief"
                    description="AI-generated insights after each session"
                    checked={settings.postSessionDebrief}
                    onChange={(checked) => updateSetting('postSessionDebrief', checked)}
                  />
                </SettingsGroup>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}; 
