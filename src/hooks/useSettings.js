import { useLocalStorage } from "./useLocalStorage";

export const THEMES = {
  default: "Graphite (Pro Dark)",
  paper: "Paper (Clean Light)",
  obsidian: "Obsidian (Purple Night)" 
};

export function useSettings() {
  const [settings, setSettings] = useLocalStorage("bits_planner_settings_v4", {
    userName: "DrBOT", 
    theme: "default"
  });

  const updateSettings = (updates) => {
    setSettings({ ...settings, ...updates });
  };

  return { settings, updateSettings };
}