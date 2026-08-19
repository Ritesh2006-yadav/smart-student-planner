import { Link } from 'react-router-dom';
import { HiClock } from 'react-icons/hi2';
import { usePomodoro } from '../context/PomodoroContext';

export default function PersistentTimer() {
  const { remainingSeconds, running } = usePomodoro();
  const mins = String(Math.floor(remainingSeconds / 60)).padStart(2, '0');
  const secs = String(remainingSeconds % 60).padStart(2, '0');
  return (
    <Link to="/" className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 px-2.5 py-1.5 text-xs font-bold text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-500/15 dark:text-indigo-200 dark:hover:bg-indigo-500/25" title="Open Pomodoro timer">
      <HiClock className="text-base" /> Focus: {mins}:{secs}{running && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-label="Timer running" />}
    </Link>
  );
}
