import { HiOutlineCalendarDays, HiPencilSquare, HiTrash } from 'react-icons/hi2';
import { localDateString } from '../utils/date';

const color = { high: 'bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300', medium: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300', low: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300' };

export default function TaskItem({ task, onToggle, onEdit, onDelete, onMarkIncomplete, compact = false }) {
  const isIncomplete = task.isMissed || task.status === 'incomplete';
  const overdue = !task.completed && task.dueDate < localDateString();
  const missedMessage = `This task was not completed on ${new Date(`${task.dueDate}T00:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}.`;
  const status = task.completed ? 'Completed' : isIncomplete ? 'Incomplete' : 'Pending';
  const statusClass = task.completed ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200' : isIncomplete ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-200' : 'bg-slate-100 text-slate-500 dark:bg-slate-800';

  return <div className={`group flex gap-3 rounded-xl border p-3 transition ${isIncomplete ? 'border-rose-200 bg-rose-50/70 hover:border-rose-300 dark:border-rose-900/60 dark:bg-rose-950/20' : 'border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/40 dark:border-slate-700/60 dark:hover:border-slate-600 dark:hover:bg-slate-700/30'} ${task.completed ? 'opacity-60' : ''}`}>
    <button onClick={() => onToggle(task)} aria-label={isIncomplete ? 'Complete missed task' : 'Complete task'} className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 ${task.completed ? 'border-indigo-600 bg-indigo-600 text-white' : isIncomplete ? 'border-rose-500' : 'border-slate-300 dark:border-slate-500'}`}>{task.completed && '✓'}</button>
    <div className="min-w-0 flex-1">
      <div className="flex flex-wrap items-center gap-2">
        <p className={`font-semibold ${task.completed ? 'line-through text-slate-500' : isIncomplete ? 'text-rose-700 dark:text-rose-300' : ''}`}>{task.title}</p>
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${color[task.priority]}`}>{task.priority}</span>
        <span title={isIncomplete ? missedMessage : `Task status: ${status}`} className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${statusClass}`}>{status}</span>
        {task.isPermanent && <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-500 dark:bg-slate-800">Recurring</span>}
      </div>
      {!compact && task.description && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{task.description}</p>}
      <div className={`mt-2 flex flex-wrap items-center gap-1.5 text-xs ${isIncomplete || overdue ? 'font-semibold text-rose-500' : 'text-slate-400'}`}><HiOutlineCalendarDays />{isIncomplete ? 'Incomplete · ' : overdue ? 'Overdue · ' : ''}{new Date(`${task.dueDate}T00:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}<span className="ml-2">{task.category}</span></div>
      {!task.completed && !isIncomplete && onMarkIncomplete && <button onClick={() => onMarkIncomplete(task)} className="mt-2 text-xs font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-300" title="Mark this task as incomplete">Mark as incomplete</button>}
    </div>
    {!task.isPermanent && <div className="flex gap-1 self-start opacity-0 transition group-hover:opacity-100"><button onClick={() => onEdit(task)} aria-label="Edit task" className="h-8 rounded-lg p-2 text-slate-400 hover:bg-white hover:text-indigo-600 dark:hover:bg-slate-800"><HiPencilSquare /></button><button onClick={() => onDelete(task.id)} aria-label="Delete task" className="h-8 rounded-lg p-2 text-slate-400 hover:bg-white hover:text-rose-500 dark:hover:bg-slate-800"><HiTrash /></button></div>}
  </div>;
}
