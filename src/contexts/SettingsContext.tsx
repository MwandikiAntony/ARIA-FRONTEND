'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Settings } from '@/types';
import { useLocalStorage } from '@/hooks/useLocalStorage';

const defaultSettings: Settings = {
  voiceActive: true,
  bargeIn: true,
  hapticFeedback: true,
  autoModeSwitch: true,
  indoorDetection: true,
  whisperHints: true,
  earpieceMode: false,
  timingIntelligence: true,
  sessionRecording: true,
  postSessionDebrief: true,
};

interface SettingsContextType {
  settings: Settings;
  updateSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
  resetSettings: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [storedSettings, setStoredSettings] = useLocalStorage<Settings>('aria-settings', defaultSettings);
  const [settings, setSettings] = useState<Settings>(storedSettings);

  useEffect(() => {
    setStoredSettings(settings);
  }, [settings, setStoredSettings]);

  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSetting, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};