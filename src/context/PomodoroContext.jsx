import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const PomodoroContext = createContext();
const STORAGE_KEY = 'ssp-pomodoro';
const DEFAULT_DURATION = 25 * 60;

const readStoredTimer = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved && typeof saved.remainingSeconds === 'number') {
      return {
        duration: saved.duration || DEFAULT_DURATION,
        remainingSeconds: saved.remainingSeconds,
        running: Boolean(saved.running),
        startedAt: saved.startedAt || null,
      };
    }
  } catch {
    // A malformed saved timer should not prevent the planner from loading.
  }
  return { duration: DEFAULT_DURATION, remainingSeconds: DEFAULT_DURATION, running: false, startedAt: null };
};

const getRemainingSeconds = (timer, now = Date.now()) => {
  if (!timer.running || !timer.startedAt) return Math.max(0, timer.remainingSeconds);
  const elapsed = Math.floor((now - timer.startedAt) / 1000);
  return Math.max(0, timer.remainingSeconds - elapsed);
};

const playCompletionSound = () => {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const context = new AudioContextClass();
    [0, 0.24].forEach((delay) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.value = 880;
      gain.gain.setValueAtTime(0.0001, context.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(0.22, context.currentTime + delay + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + delay + 0.16);
      oscillator.connect(gain).connect(context.destination);
      oscillator.start(context.currentTime + delay);
      oscillator.stop(context.currentTime + delay + 0.18);
    });
    window.setTimeout(() => context.close(), 550);
  } catch {
    // Browsers may block audio after a tab has been suspended; the notification still appears.
  }
};

export function PomodoroProvider({ children }) {
  const [timer, setTimer] = useState(readStoredTimer);
  const [now, setNow] = useState(Date.now());
  const remainingSeconds = getRemainingSeconds(timer, now);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(timer));
  }, [timer]);

  useEffect(() => {
    if (!timer.running) return undefined;
    const tick = () => setNow(Date.now());
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [timer.running]);

  useEffect(() => {
    const syncAfterBackgrounding = () => setNow(Date.now());
    window.addEventListener('focus', syncAfterBackgrounding);
    document.addEventListener('visibilitychange', syncAfterBackgrounding);
    return () => {
      window.removeEventListener('focus', syncAfterBackgrounding);
      document.removeEventListener('visibilitychange', syncAfterBackgrounding);
    };
  }, []);

  useEffect(() => {
    if (!timer.running || remainingSeconds > 0) return;
    setTimer((current) => ({ ...current, running: false, remainingSeconds: 0, startedAt: null }));
    playCompletionSound();
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Focus session complete! 🎉', {
        body: `Your ${Math.round(timer.duration / 60)}-minute focus session has finished.`,
      });
    }
  }, [remainingSeconds, timer.duration, timer.running]);

  const value = useMemo(() => ({
    duration: timer.duration,
    remainingSeconds,
    running: timer.running,
    start: () => {
      if ('Notification' in window && Notification.permission === 'default') Notification.requestPermission();
      setNow(Date.now());
      setTimer((current) => current.running || getRemainingSeconds(current) <= 0
        ? current
        : { ...current, remainingSeconds: getRemainingSeconds(current), running: true, startedAt: Date.now() });
    },
    pause: () => {
      setTimer((current) => ({ ...current, remainingSeconds: getRemainingSeconds(current), running: false, startedAt: null }));
      setNow(Date.now());
    },
    reset: () => {
      setTimer((current) => ({ ...current, remainingSeconds: current.duration, running: false, startedAt: null }));
      setNow(Date.now());
    },
  }), [remainingSeconds, timer.duration, timer.running]);

  return <PomodoroContext.Provider value={value}>{children}</PomodoroContext.Provider>;
}

export const usePomodoro = () => useContext(PomodoroContext);
