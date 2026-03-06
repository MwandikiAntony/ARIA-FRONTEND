'use client';

import React from 'react';
import { SettingsGroup } from './SettingsGroup';
import { SettingRow } from './SettingRow';
import { useSettings } from '@/contexts/SettingsContext';

export const SettingsPanel: React.FC = () => {
  const { settings, updateSetting } = useSettings();

  return (
    <section id="settings" className="bg-bg-void border-t border-border px-4 md:px-8 py-12 md:py-16">
      <div className="mb-8 md:mb-10">
        <div className="section-label">Configuration</div>
        <h2 className="section-title">
          Settings <span className="text-cyan">&</span> Preferences
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl">
        {/* Navigation Settings */}
        <div className="modal-overlay">
          <div className="modal-header">
            <h3 className="modal-title">Navigation Settings</h3>
            <button className="modal-close" aria-label="Close">
              ✕
            </button>
          </div>
          <div className="modal-body">
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
          </div>
        </div>

        {/* Coach Settings */}
        <div className="modal-overlay">
          <div className="modal-header">
            <h3 className="modal-title">Coach Settings</h3>
            <button className="modal-close" aria-label="Close">
              ✕
            </button>
          </div>
          <div className="modal-body">
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
          </div>
        </div>
      </div>
    </section>
  );
}; 
