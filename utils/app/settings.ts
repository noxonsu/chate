import { Settings } from '@/types/settings';

const STORAGE_KEY = 'settings';
declare global {
  interface Window {
    sensorica_openaiproxy?: string;
    sensorica_client_id?: string;
    post_id?: string;
    main_title?: string;
    sensorica_theme?: string;
  }
}

export const getSettings = (): Settings => {
  let settings: Settings = {
    theme: (window.sensorica_theme === 'light' || window.sensorica_theme === 'dark') ? window.sensorica_theme : 'light',
  };
  const settingsJson = localStorage.getItem(STORAGE_KEY);
  if (settingsJson) {
    try {
      let savedSettings = JSON.parse(settingsJson) as Settings;
      settings = Object.assign(settings, savedSettings);
    } catch (e) {
      console.error(e);
    }
  }
  return settings;
};

export const saveSettings = (settings: Settings) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
};
