import { useMemo, useState } from 'react';
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi2';
import { useTasks } from '../context/TaskContext';
import { usePermanentTasks } from '../context/PermanentTaskContext';
import { localDateString } from '../utils/date';

const names = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function Calendar() {
  const { tasks } = useTasks();
  const { getPermanentTasksForDate } = usePermanentTasks();
  const [date, setDate] = useState(new Date());
  const year = date.getFullYear();
  const month = date.getMonth();
  const first = new Date(year, month, 1).getDay();
  const days = new Date(year, month + 1, 0).getDate();
  const cells = useMemo(() => Array.from({ length: first + days }, (_, i) => i < first ? null : i - first + 1), [first, days]);
  const change = (n) => setDate(new Date(year, month + n, 1));
  const toISO = (day) => `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  const today = localDateString();

  // Including generated instances here gives each scheduled recurring task a
  // stable, date-specific entry in calendar history (including missed days).
  const taskForDate = (day) => {
    const dayString = toISO(day);
    return [...tasks.filter((task) => task.dueDate === dayString), ...getPermanentTasksForDate(dayString)];
  };

  return <div className="space-y-6 animate-fade-up"><div><h1 className="text-3xl font-bold">Calendar</h1><p className="mt-1 text-slate-500">See your deadlines at a glance.</p></div><div className="card overflow-x-auto"><div className="min-w-[620px]"><div className="flex items-center justify-between border-b border-slate-100 p-5 dark:border-slate-700"><button className="btn-secondary !px-3" onClick={() => change(-1)}><HiChevronLeft /></button><h2 className="text-lg font-bold">{date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</h2><button className="btn-secondary !px-3" onClick={() => change(1)}><HiChevronRight /></button></div><div className="grid grid-cols-7 border-l border-slate-100 dark:border-slate-700">{names.map((name) => <div key={name} className="border-b border-r border-slate-100 py-3 text-center text-xs font-bold uppercase text-slate-400 dark:border-slate-700">{name}</div>)}{cells.map((day, index) => <div key={index} className="min-h-24 border-b border-r border-slate-100 p-2 dark:border-slate-700 sm:min-h-32">{day && <><span className={`grid h-7 w-7 place-items-center rounded-full text-xs font-semibold ${toISO(day) === today ? 'bg-indigo-600 text-white' : ''}`}>{day}</span><div className="mt-1 space-y-1">{taskForDate(day).slice(0, 2).map((task) => {
    const missedText = `Incomplete task\n${task.title} was not completed on ${new Date(task.dueDate + 'T00:00:00').toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}.`;
    const isIncomplete = task.isMissed || task.status === 'incomplete';
    return <div title={isIncomplete ? missedText : task.title} key={`${task.id}-${task.dueDate || task.id}`} className={`truncate rounded px-1.5 py-1 text-[10px] font-semibold ${task.completed ? 'bg-slate-100 text-slate-400 line-through dark:bg-slate-700' : isIncomplete ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-200' : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-200'}`}>{task.title}</div>;
  })}</div></>}</div>)}</div></div></div></div>;
}
