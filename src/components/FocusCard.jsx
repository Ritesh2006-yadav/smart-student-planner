import { HiArrowPath, HiPause, HiPlay } from 'react-icons/hi2';
import { FOCUS_TIMERS, usePomodoro } from '../context/PomodoroContext';

const formatTime = (remainingSeconds) => {
  const minutes = String(Math.floor(remainingSeconds / 60)).padStart(2, '0');
  const seconds = String(remainingSeconds % 60).padStart(2, '0');
  return `${minutes}:${seconds}`;
};

function TimerCard({ id, title, description, actionLabel }) {
  const { timers, completedTimers, start, pause, reset } = usePomodoro();
  const timer = timers[id];
  const completed = completedTimers[id];

  return (
    <article className={`rounded-xl border border-white/20 bg-white/10 p-3 sm:p-3.5 backdrop-blur-sm transition ${timer.running ? 'ring-1 ring-white/35' : ''}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-xs sm:text-sm font-bold text-white truncate">{title}</h3>
          <p className="mt-0.5 text-[10px] sm:text-[11px] text-indigo-100/85 truncate">{description}</p>
        </div>
        <span className={`mt-1 flex h-2 w-2 shrink-0 rounded-full ${timer.running ? 'bg-emerald-300 shadow-[0_0_0_4px_rgba(167,243,208,.16)] animate-pulse' : 'bg-white/35'}`} aria-label={timer.running ? 'Timer running' : 'Timer paused'} />
      </div>

      <div className="my-2 sm:my-2.5 text-center font-bold tabular-nums text-2xl sm:text-3xl lg:text-[2.2rem] tracking-tight text-white" aria-live="polite">
        {formatTime(timer.remainingSeconds)}
      </div>

      <div className="flex gap-2">
        <button onClick={() => (timer.running ? pause(id) : start(id))} className="btn min-w-0 flex-1 bg-white px-2 py-1.5 text-xs text-indigo-700 hover:bg-indigo-50 !rounded-lg">
          {timer.running ? <HiPause className="text-sm" /> : <HiPlay className="text-sm" />}
          {timer.running ? 'Pause' : actionLabel}
        </button>
        <button onClick={() => reset(id)} className="btn border border-white/30 px-2 py-1.5 text-xs text-white hover:bg-white/10 !rounded-lg" aria-label={`Reset ${title}`}>
          <HiArrowPath className="text-sm" /> <span className="hidden sm:inline">Reset</span>
        </button>
      </div>
      <p className={`mt-1.5 sm:mt-2 min-h-3 text-center text-[10px] sm:text-[11px] truncate ${completed ? 'text-emerald-200' : 'text-indigo-100/80'}`} role="status">
        {completed ? 'Focus session complete!' : timer.running ? 'Focus session in progress' : 'Ready when you are'}
      </p>
    </article>
  );
}

export default function FocusCard() {
  return (
    <section className="shrink-0 overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-700 p-3.5 sm:p-4 text-white shadow-soft">
      <div className="mb-2 sm:mb-2.5">
        <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-200">FOCUS SESSION</p>
        <h2 className="mt-0.5 text-base sm:text-lg font-bold">Stay in the zone</h2>
      </div>
      <div className="grid gap-2.5 sm:gap-3 sm:grid-cols-2">
        <TimerCard id="pomodoro" title={FOCUS_TIMERS.pomodoro.label} description="25 minutes of deep work" actionLabel="Start focus" />
        <TimerCard id="hour" title={FOCUS_TIMERS.hour.label} description="60 minutes of distraction-free time" actionLabel="Start" />
      </div>
    </section>
  );
}
