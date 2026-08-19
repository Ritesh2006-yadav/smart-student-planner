import { usePomodoro } from '../context/PomodoroContext';

export default function FocusCard() {
  const { remainingSeconds, running, start, pause, reset } = usePomodoro();
  const mins = String(Math.floor(remainingSeconds / 60)).padStart(2, '0');
  const secs = String(remainingSeconds % 60).padStart(2, '0');

  return (
    <section className="overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-700 p-4 text-white shadow-soft shrink-0">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-200">FOCUS SESSION</p>
          <h2 className="text-lg font-bold">Pomodoro timer</h2>
        </div>
      </div>
      <div className="my-4 text-center text-5xl font-bold tracking-tight">{mins}:{secs}</div>
      <div className="flex gap-2">
        <button onClick={running ? pause : start} className="btn flex-1 bg-white px-3 py-2 text-sm text-indigo-700 hover:bg-indigo-50">
          {running ? 'Pause' : 'Start focus'}
        </button>
        <button onClick={reset} className="btn border border-white/30 px-3 py-2 text-sm hover:bg-white/10">Reset</button>
      </div>
      <p className="mt-3 text-center text-[11px] text-indigo-200">25 minutes of uninterrupted progress</p>
    </section>
  );
}
