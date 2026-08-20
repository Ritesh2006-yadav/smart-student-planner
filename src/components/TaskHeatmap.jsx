import { useMemo, useState } from 'react';
import { HiCheckCircle, HiClock, HiXMark } from 'react-icons/hi2';
import { useTasks } from '../context/TaskContext';
import { localDateString } from '../utils/date';

const dayKey = (date) => localDateString(date);
const prettyDate = (key) => new Date(`${key}T00:00:00`).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });

function calculateStreak(tasks) {
  const completedDays = new Set(tasks.filter(t => t.completed).map(t => t.dueDate));
  let current = 0, longest = 0, running = 0;
  const cursor = new Date(); cursor.setHours(0, 0, 0, 0);
  while (completedDays.has(dayKey(cursor))) { current += 1; cursor.setDate(cursor.getDate() - 1); }
  const dates = [...completedDays].sort();
  dates.forEach((key, index) => {
    if (!index || (new Date(`${key}T00:00:00`) - new Date(`${dates[index - 1]}T00:00:00`)) === 86400000) running += 1;
    else running = 1;
    longest = Math.max(longest, running);
  });
  return { current, longest };
}

export default function TaskHeatmap() {
  const { tasks } = useTasks();
  const [selectedDay, setSelectedDay] = useState(null);
  
  const [viewMonth, setViewMonth] = useState(() => {
    const d = new Date();
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const { byDay, summary, streaks, minMaxDates } = useMemo(() => {
    const grouped = tasks.reduce((map, task) => {
      if (!map[task.dueDate]) map[task.dueDate] = [];
      map[task.dueDate].push(task);
      return map;
    }, {});
    
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const incomplete = tasks.filter(t => t.status === 'incomplete').length;
    
    let min = new Date();
    let max = new Date();
    if (tasks.length > 0) {
      const parseLocal = (isoStr) => {
        if (!isoStr) return new Date();
        const [y, m, d] = isoStr.split('-');
        return new Date(y, m - 1, d);
      };
      min = parseLocal(tasks[0].dueDate);
      max = parseLocal(tasks[0].dueDate);
      tasks.forEach(t => {
        const d = parseLocal(t.dueDate);
        if (d < min) min = new Date(d);
        if (d > max) max = new Date(d);
      });
    }
    const today = new Date();
    if (today < min) min = new Date(today);
    if (today > max) max = new Date(today);
    
    min.setDate(1); min.setHours(0, 0, 0, 0);
    max.setDate(1); max.setHours(0, 0, 0, 0);
    
    return { 
      byDay: grouped, 
      summary: { total, completed, incomplete, pending: total - completed - incomplete, rate: total ? Math.round((completed / total) * 100) : 0 },
      streaks: calculateStreak(tasks),
      minMaxDates: { min, max }
    };
  }, [tasks]);

  const selectedTasks = selectedDay ? (byDay[selectedDay] || []) : [];
  
  const intensity = (key) => {
    const dayTasks = byDay[key] || [];
    const amount = dayTasks.filter(t => t.completed).length;
    const incomplete = dayTasks.filter(t => t.status === 'incomplete').length;
    if (incomplete && !amount) return 'bg-rose-200 dark:bg-rose-900/60';
    if (!amount) return 'bg-slate-100 dark:bg-slate-800';
    if (amount === 1) return 'bg-emerald-200 dark:bg-emerald-900/60';
    if (amount >= 2 && amount <= 3) return 'bg-emerald-400 dark:bg-emerald-700/80';
    if (amount >= 4 && amount <= 5) return 'bg-emerald-600 dark:bg-emerald-500';
    return 'bg-emerald-800 dark:bg-emerald-400';
  };

  const prevMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1);
  const nextMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1);

  const canGoPrev = prevMonth >= minMaxDates.min;
  const canGoNext = nextMonth <= minMaxDates.max;

  const daysInMonth = useMemo(() => {
    const year = viewMonth.getFullYear();
    const month = viewMonth.getMonth();
    const days = [];
    const date = new Date(year, month, 1);
    while (date.getMonth() === month) {
      days.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }
    return days;
  }, [viewMonth]);

  const firstDayOfWeek = daysInMonth[0].getDay();
  const lastDayOfWeek = daysInMonth[daysInMonth.length - 1].getDay();
  const emptyCellsBefore = Array.from({ length: firstDayOfWeek });
  const emptyCellsAfter = Array.from({ length: 6 - lastDayOfWeek });

  return (
    <section className="card p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold">Task activity</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Your task completion activity by month.</p>
        </div>
        <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
          {summary.rate}% completion rate
        </span>
      </div>
      
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        <Summary label="Total tasks" value={summary.total} />
        <Summary label="Completed" value={summary.completed} color="text-emerald-600" />
        <Summary label="Pending" value={summary.pending} color="text-amber-600" />
        <Summary label="Incomplete" value={summary.incomplete} color="text-rose-600" />
        <Summary label="Completion" value={`${summary.rate}%`} color="text-indigo-600" />
        <Summary label="Current streak" value={`${streaks.current} d`} />
        <Summary label="Best streak" value={`${streaks.longest} d`} />
      </div>

      <div className="mt-4 flex flex-col items-center">
        <div className="mb-4 flex items-center justify-between w-full max-w-md px-2">
          <button 
            onClick={() => setViewMonth(prevMonth)} 
            disabled={!canGoPrev} 
            className="rounded-full p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent dark:hover:bg-slate-700 transition-colors font-bold text-xl w-10 h-10 flex items-center justify-center"
            aria-label="Previous"
          >
            ←
          </button>
          <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200 min-w-[120px] text-center">
            {viewMonth.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
          </h3>
          <button 
            onClick={() => setViewMonth(nextMonth)} 
            disabled={!canGoNext} 
            className="rounded-full p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent dark:hover:bg-slate-700 transition-colors font-bold text-xl w-10 h-10 flex items-center justify-center"
            aria-label="Next"
          >
            →
          </button>
        </div>

        <div className="w-full max-w-md overflow-visible">
          <div key={viewMonth.toISOString()} className="grid grid-cols-7 gap-1 sm:gap-2 animate-fade-up">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
              <div key={i} className="text-center text-[10px] sm:text-xs font-semibold text-slate-400 mb-1">
                {day}
              </div>
            ))}
            
            {emptyCellsBefore.map((_, i) => (
              <div key={`empty-before-${i}`} className="aspect-square" />
            ))}
            
            {daysInMonth.map(date => {
              const key = dayKey(date);
              const dayTasks = byDay[key] || [];
              const completed = dayTasks.filter(t => t.completed).length;
              const incomplete = dayTasks.filter(t => t.status === 'incomplete').length;
              const pending = dayTasks.length - completed - incomplete;
              const isToday = key === dayKey(new Date());
              
              return (
                <button 
                  key={key} 
                  onClick={() => setSelectedDay(key)} 
                  aria-label={`View tasks for ${prettyDate(key)}`} 
                  className={`group relative aspect-square w-full rounded-md transition duration-200 hover:scale-110 hover:ring-2 hover:ring-emerald-500/40 ${intensity(key)} ${isToday ? 'ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-slate-800' : ''}`}
                >
                  <span className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-3 hidden w-48 -translate-x-1/2 rounded-xl bg-slate-950 px-3 py-2.5 text-left text-xs text-white shadow-xl group-hover:block whitespace-nowrap">
                    <strong>{prettyDate(key)}</strong>
                    <span className="mt-2 block text-slate-300">Total Tasks: {dayTasks.length}</span>
                    <span className="block text-emerald-300">Completed: {completed}</span>
                    <span className="block text-amber-300">Pending: {pending}</span>
                    <span className="block text-rose-300">Incomplete: {incomplete}</span>
                    <span className="block text-indigo-300">Completion: {dayTasks.length ? Math.round((completed / dayTasks.length) * 100) : 0}%</span>
                  </span>
                </button>
              );
            })}
            
            {emptyCellsAfter.map((_, i) => (
              <div key={`empty-after-${i}`} className="aspect-square" />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-500">
        <span>Less</span>
        <span className="h-3.5 w-3.5 rounded-sm bg-slate-100 dark:bg-slate-800" />
        <span className="h-3.5 w-3.5 rounded-sm bg-emerald-200 dark:bg-emerald-900/60" />
        <span className="h-3.5 w-3.5 rounded-sm bg-emerald-400 dark:bg-emerald-700/80" />
        <span className="h-3.5 w-3.5 rounded-sm bg-emerald-600 dark:bg-emerald-500" />
        <span className="h-3.5 w-3.5 rounded-sm bg-emerald-800 dark:bg-emerald-400" />
        <span>More</span>
      </div>

      {selectedDay && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/55 p-4 animate-in fade-in duration-200">
          <div className="card w-full max-w-md p-5 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="mb-5 flex items-start justify-between">
              <div>
                <h3 className="font-bold text-lg">Tasks for {prettyDate(selectedDay)}</h3>
                <p className="mt-1 text-sm text-slate-500">
                  {selectedTasks.length} task{selectedTasks.length !== 1 && 's'} scheduled
                </p>
              </div>
              <button 
                aria-label="Close day tasks" 
                onClick={() => setSelectedDay(null)} 
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <HiXMark className="text-xl" />
              </button>
            </div>
            {selectedTasks.length ? (
              <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
                {selectedTasks.map(task => (
                  <div key={task.id} className={`flex items-start gap-3 rounded-xl p-3 ${task.completed ? 'bg-emerald-50 dark:bg-emerald-500/10' : task.status === 'incomplete' ? 'bg-rose-50 dark:bg-rose-500/10' : 'bg-amber-50 dark:bg-amber-500/10'}`}>
                    <div className="pt-0.5">
                      {task.completed ? <HiCheckCircle className="shrink-0 text-xl text-emerald-600" /> : task.status === 'incomplete' ? <HiXMark className="shrink-0 text-xl text-rose-600" /> : <HiClock className="shrink-0 text-xl text-amber-600" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold">{task.title}</p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[11px]">
                        <span className={`font-semibold uppercase tracking-wider ${task.completed ? 'text-emerald-600' : task.status === 'incomplete' ? 'text-rose-600' : 'text-amber-600'}`}>
                          {task.completed ? 'Completed' : task.status === 'incomplete' ? 'Incomplete' : 'Pending'}
                        </span>
                        {task.dueTime && (
                          <span className="rounded bg-black/5 dark:bg-white/10 px-1.5 py-0.5 font-medium text-slate-600 dark:text-slate-300">
                            {task.dueTime}
                          </span>
                        )}
                        {task.priority && (
                          <span className="rounded bg-black/5 dark:bg-white/10 px-1.5 py-0.5 font-medium capitalize text-slate-600 dark:text-slate-300">
                            {task.priority} Priority
                          </span>
                        )}
                        {task.category && (
                          <span className="rounded bg-black/5 dark:bg-white/10 px-1.5 py-0.5 font-medium text-slate-600 dark:text-slate-300">
                            {task.category}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="rounded-xl bg-slate-50 p-6 text-center text-sm text-slate-500 dark:bg-slate-700/40">
                No tasks for this day.
              </p>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

function Summary({ label, value, color = 'text-slate-900 dark:text-white' }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-700/35">
      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`mt-1 text-xl font-bold ${color}`}>{value}</p>
    </div>
  );
}
