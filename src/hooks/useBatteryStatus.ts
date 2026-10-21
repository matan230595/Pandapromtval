import { useState, useEffect, useCallback, useRef } from 'react';

export interface BatteryStatus {
  level: number; // 0 to 100
  charging: boolean;
  chargingTime: number;
  dischargingTime: number;
  isSupported: boolean;
  isLowBattery: boolean; // level <= 20 and not charging
  powerSaveMode: boolean;
  togglePowerSaveMode: () => void;
  setPowerSaveMode: (val: boolean) => void;
  simulatedLevel: number | null;
  setSimulatedLevel: (lvl: number | null) => void;
  isSimulated: boolean;
}

const STORAGE_KEY = 'promptvault_power_saver';
const LOW_BATTERY_THRESHOLD = 20;

export function useBatteryStatus(onAutoPowerSaveTriggered?: (level: number) => void): BatteryStatus {
  const [level, setLevel] = useState<number>(100);
  const [charging, setCharging] = useState<boolean>(true);
  const [chargingTime, setChargingTime] = useState<number>(0);
  const [dischargingTime, setDischargingTime] = useState<number>(Infinity);
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const [simulatedLevel, setSimulatedLevel] = useState<number | null>(null);

  // Initialize powerSaveMode from localStorage, or default false
  const [powerSaveMode, setPowerSaveModeState] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved === 'true';
    } catch {
      return false;
    }
  });

  const lastNotifiedLevelRef = useRef<number | null>(null);

  const effectiveLevel = simulatedLevel !== null ? simulatedLevel : level;
  const isLowBattery = effectiveLevel <= LOW_BATTERY_THRESHOLD && !charging;

  // Set power saving mode with persistence and DOM class update
  const setPowerSaveMode = useCallback((val: boolean) => {
    setPowerSaveModeState(val);
    try {
      localStorage.setItem(STORAGE_KEY, val ? 'true' : 'false');
    } catch {}

    if (typeof document !== 'undefined') {
      if (val) {
        document.documentElement.classList.add('power-saving-mode');
      } else {
        document.documentElement.classList.remove('power-saving-mode');
      }
    }
  }, []);

  const togglePowerSaveMode = useCallback(() => {
    setPowerSaveMode(!powerSaveMode);
  }, [powerSaveMode, setPowerSaveMode]);

  // Keep DOM class in sync
  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (powerSaveMode) {
        document.documentElement.classList.add('power-saving-mode');
      } else {
        document.documentElement.classList.remove('power-saving-mode');
      }
    }
  }, [powerSaveMode]);

  // Connect to Navigator Battery API
  useEffect(() => {
    let batteryInstance: any = null;

    const updateBatteryInfo = (battery: any) => {
      const currentLevel = Math.round(battery.level * 100);
      setLevel(currentLevel);
      setCharging(battery.charging);
      setChargingTime(battery.chargingTime);
      setDischargingTime(battery.dischargingTime);
      setIsSupported(true);
    };

    if (typeof navigator !== 'undefined' && 'getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        batteryInstance = battery;
        updateBatteryInfo(battery);

        const onLevelChange = () => updateBatteryInfo(battery);
        const onChargingChange = () => updateBatteryInfo(battery);
        const onChargingTimeChange = () => updateBatteryInfo(battery);
        const onDischargingTimeChange = () => updateBatteryInfo(battery);

        battery.addEventListener('levelchange', onLevelChange);
        battery.addEventListener('chargingchange', onChargingChange);
        battery.addEventListener('chargingtimechange', onChargingTimeChange);
        battery.addEventListener('dischargingtimechange', onDischargingTimeChange);
      }).catch(() => {
        // Fallback if rejected or permission blocked
        setIsSupported(false);
      });
    } else {
      setIsSupported(false);
    }

    return () => {
      if (batteryInstance) {
        // Clean up listeners if needed
      }
    };
  }, []);

  // Auto-activate power saving mode when battery becomes low (<= 20% and not charging)
  useEffect(() => {
    if (isLowBattery && !powerSaveMode) {
      // Don't re-trigger notification in the same session for the same battery level
      if (lastNotifiedLevelRef.current !== effectiveLevel) {
        lastNotifiedLevelRef.current = effectiveLevel;
        setPowerSaveMode(true);
        if (onAutoPowerSaveTriggered) {
          onAutoPowerSaveTriggered(effectiveLevel);
        }
      }
    }
  }, [isLowBattery, powerSaveMode, effectiveLevel, setPowerSaveMode, onAutoPowerSaveTriggered]);

  return {
    level: effectiveLevel,
    charging: simulatedLevel !== null ? false : charging,
    chargingTime,
    dischargingTime,
    isSupported,
    isLowBattery,
    powerSaveMode,
    togglePowerSaveMode,
    setPowerSaveMode,
    simulatedLevel,
    setSimulatedLevel,
    isSimulated: simulatedLevel !== null
  };
}
