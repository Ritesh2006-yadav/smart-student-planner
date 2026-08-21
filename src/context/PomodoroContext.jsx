import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const PomodoroContext = createContext();
const STORAGE_KEY = 'ssp-focus-timers';
const LEGACY_STORAGE_KEY = 'ssp-pomodoro';

export const FOCUS_TIMERS = {
  pomodoro: { duration: 25 * 60, label: 'Pomodoro timer' },
  hour: { duration: 60 * 60, label: '1 Hour Focus' },
};

let audioContext;

const createTimer = (duration) => ({ duration, remainingSeconds: duration, running: false, startedAt: null });

const getRemainingSeconds = (timer, now = Date.now()) => {
  if (!timer.running || !timer.startedAt) return Math.max(0, timer.remainingSeconds);
  const elapsed = Math.floor((now - timer.startedAt) / 1000);
  return Math.max(0, timer.remainingSeconds - elapsed);
};

const readStoredTimers = () => {
  const defaults = Object.fromEntries(Object.entries(FOCUS_TIMERS).map(([id, config]) => [id, createTimer(config.duration)]));
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved?.pomodoro && saved?.hour) {
      return Object.fromEntries(Object.entries(defaults).map(([id, fallback]) => {
        const timer = saved[id];
        return [id, {
          duration: fallback.duration,
          remainingSeconds: typeof timer.remainingSeconds === 'number' ? Math.max(0, timer.remainingSeconds) : fallback.duration,
          running: Boolean(timer.running),
          startedAt: timer.startedAt || null,
        }];
      }));
    }

    // Preserve an existing Pomodoro session when upgrading from the single-timer version.
    const legacy = JSON.parse(localStorage.getItem(LEGACY_STORAGE_KEY));
    if (legacy && typeof legacy.remainingSeconds === 'number') {
      defaults.pomodoro = {
        duration: FOCUS_TIMERS.pomodoro.duration,
        remainingSeconds: Math.max(0, legacy.remainingSeconds),
        running: Boolean(legacy.running),
        startedAt: legacy.startedAt || null,
      };
    }
  } catch {
    // Invalid saved data should never prevent the planner from loading.
  }
  return defaults;
};

const unlockCompletionSound = () => {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;
    audioContext ??= new AudioContextClass();
    if (audioContext.state === 'suspended') audioContext.resume();
    return audioContext;
  } catch {
    return null;
  }
};

const scheduleCompletionSound = (context) => {
  const start = context.currentTime + 0.03;
  [0, 0.26].forEach((delay, index) => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(index ? 988 : 784, start + delay);
    gain.gain.setValueAtTime(0.0001, start + delay);
    gain.gain.exponentialRampToValueAtTime(0.16, start + delay + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + delay + 0.17);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start(start + delay);
    oscillator.stop(start + delay + 0.19);
  });
};

const playCompletionSound = () => {
  const context = unlockCompletionSound();
  if (!context) return;
  if (context.state === 'running') {
    scheduleCompletionSound(context);
  } else {
    // The context was unlocked on Start; retry after a browser resumes it.
    context.resume().then(() => scheduleCompletionSound(context)).catch(() => {});
  }
};

export function PomodoroProvider({ children }) {
  const [timers, setTimers] = useState(readStoredTimers);
  const [now, setNow] = useState(Date.now());
  const [completedTimers, setCompletedTimers] = useState({ pomodoro: false, hour: false });
  const resolvedTimers = useMemo(() => Object.fromEntries(
    Object.entries(timers).map(([id, timer]) => [id, { ...timer, remainingSeconds: getRemainingSeconds(timer, now) }]),
  ), [timers, now]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(timers));
  }, [timers]);

  useEffect(() => {
    if (!Object.values(timers).some((timer) => timer.running)) return undefined;
    const tick = () => setNow(Date.now());
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [timers]);

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
    const finished = Object.entries(resolvedTimers).find(([, timer]) => timer.running && timer.remainingSeconds === 0);
    if (!finished) return;
    const [id] = finished;
    setTimers((current) => ({ ...current, [id]: { ...current[id], running: false, remainingSeconds: 0, startedAt: null } }));
    setCompletedTimers((current) => ({ ...current, [id]: true }));
    playCompletionSound();
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Focus session complete! 🎉', {
        body: `Your ${Math.round(FOCUS_TIMERS[id].duration / 60)}-minute focus session has finished.`,
      });
    }
  }, [resolvedTimers]);

  const value = useMemo(() => {
    const start = (id) => {
      unlockCompletionSound(); // Unlock in the click gesture so the later alarm can play automatically.
      if ('Notification' in window && Notification.permission === 'default') Notification.requestPermission();
      setNow(Date.now());
      setCompletedTimers((current) => ({ ...current, [id]: false }));
      setTimers((current) => {
        const timer = current[id];
        const remainingSeconds = getRemainingSeconds(timer);
        if (timer.running || remainingSeconds === 0) return current;
        return { ...current, [id]: { ...timer, remainingSeconds, running: true, startedAt: Date.now() } };
      });
    };
    const pause = (id) => {
      setTimers((current) => {
        const timer = current[id];
        return { ...current, [id]: { ...timer, remainingSeconds: getRemainingSeconds(timer), running: false, startedAt: null } };
      });
      setNow(Date.now());
    };
    const reset = (id) => {
      setTimers((current) => ({ ...current, [id]: createTimer(current[id].duration) }));
      setCompletedTimers((current) => ({ ...current, [id]: false }));
      setNow(Date.now());
    };

    return {
      timers: resolvedTimers,
      completedTimers,
      start,
      pause,
      reset,
      // Backwards-compatible API used by the compact header timer.
      duration: resolvedTimers.pomodoro.duration,
      remainingSeconds: resolvedTimers.pomodoro.remainingSeconds,
      running: resolvedTimers.pomodoro.running,
    };
  }, [completedTimers, resolvedTimers]);

  return <PomodoroContext.Provider value={value}>{children}</PomodoroContext.Provider>;
}

export const usePomodoro = () => useContext(PomodoroContext);
