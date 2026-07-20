import { useEffect, useState, useMemo } from 'react';
import { HiPlus } from 'react-icons/hi2';
import { useTasks } from '../context/TaskContext';
import { useAuth } from '../context/AuthContext';
import TaskItem from '../components/TaskItem';
import Modal from '../components/Modal';
import TaskForm from '../components/TaskForm';
import TaskHeatmap from '../components/TaskHeatmap';

const getGreetingAndEmoji = () => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return { text: 'Good Morning', emoji: '👋' };
  if (hour >= 12 && hour < 17) return { text: 'Good Afternoon', emoji: '☀️' };
  if (hour >= 17 && hour < 21) return { text: 'Good Evening', emoji: '🌇' };
  return { text: 'Good Night', emoji: '🌙' };
};

export default function Dashboard() {
  const { tasks, stats, addTask, updateTask, removeTask } = useTasks();
  const { user } = useAuth();
  
  const [show, setShow] = useState(false);
  const [editing, setEditing] = useState(null);
  
  const [timeState, setTimeState] = useState(getGreetingAndEmoji());
  
  useEffect(() => {
    const interval = setInterval(() => setTimeState(getGreetingAndEmoji()), 60000);
    return () => clearInterval(interval);
  }, []);

  const close = () => { setShow(false); setEditing(null); };
  const save = (task) => { editing ? updateTask(editing.id, task) : addTask(task); close(); };
  const edit = (task) => { setEditing(task); setShow(true); };
  
  const userName = user?.name || 'Student';

  const sortedUpcomingTasks = useMemo(() => {
    const pending = tasks.filter(t => !t.completed);
    return pending.sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  }, [tasks]);

  return (
    <div className="space-y-7 animate-fade-up">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-indigo-600">YOUR PRODUCTIVITY SPACE</p>
          <h1 key={timeState.text} className="mt-1 text-3xl font-bold tracking-tight animate-fade-up">
            {timeState.text}, {userName} {timeState.emoji}
          </h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400">Here’s a clear view of what needs your attention.</p>
        </div>
        <button onClick={() => setShow(true)} className="btn-primary">
          <HiPlus className="text-lg" />Add task
        </button>
      </div>
      
      <div className="grid gap-6 lg:grid-cols-[6fr_4fr] items-start">
        <div className="min-w-0 w-full h-full">
          <TaskHeatmap />
        </div>
        
        <div className="flex flex-col gap-6 min-w-0 h-full">
          <section className="card flex flex-col p-5 sm:p-6 flex-1 min-h-[300px]">
            <div className="mb-5 flex items-center justify-between shrink-0">
              <div>
                <h2 className="font-bold">Upcoming tasks</h2>
                <p className="text-sm text-slate-500">Stay on top of your priorities</p>
              </div>
              <span className="rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-600 dark:bg-indigo-500/15">
                {stats.pending} open
              </span>
            </div>
            
            <div className="space-y-2 overflow-y-auto pr-2 flex-1">
              {sortedUpcomingTasks.length > 0 ? (
                sortedUpcomingTasks.map(task => (
                  <TaskItem 
                    key={task.id} 
                    task={task} 
                    compact 
                    onToggle={item => updateTask(item.id, { completed: !item.completed })} 
                    onEdit={edit} 
                    onDelete={removeTask} 
                  />
                ))
              ) : (
                <div className="flex h-full items-center justify-center text-center text-sm text-slate-500">
                  <p>No upcoming tasks.<br/>Enjoy your free time!</p>
                </div>
              )}
            </div>
          </section>
          
          <FocusCard />
        </div>
      </div>
      
      {show && (
        <Modal title={editing ? 'Edit task' : 'Create a new task'} onClose={close}>
          <TaskForm task={editing} onSave={save} onClose={close} />
        </Modal>
      )}
    </div>
  );
}

function FocusCard() { 
  const [seconds, setSeconds] = useState(25 * 60);
  const [running, setRunning] = useState(false); 
  
  const mins = String(Math.floor(seconds / 60)).padStart(2, '0');
  const secs = String(seconds % 60).padStart(2, '0'); 
  
  useEffect(() => { 
    if (!running) return; 
    const id = setInterval(() => setSeconds(s => s > 0 ? s - 1 : 25 * 60), 1000); 
    return () => clearInterval(id); 
  }, [running]); 
  
  return (
    <section className="overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-700 p-4 text-white shadow-soft shrink-0">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-200">FOCUS SESSION</p>
          <h2 className="text-lg font-bold">Pomodoro timer</h2>
        </div>
      </div>
      
      <div className="my-4 text-center text-5xl font-bold tracking-tight">
        {mins}:{secs}
      </div>
      
      <div className="flex gap-2">
        <button 
          onClick={() => setRunning(!running)} 
          className="btn flex-1 bg-white px-3 py-2 text-sm text-indigo-700 hover:bg-indigo-50"
        >
          {running ? 'Pause' : 'Start focus'}
        </button>
        <button 
          onClick={() => { setSeconds(25 * 60); setRunning(false); }} 
          className="btn border border-white/30 px-3 py-2 text-sm hover:bg-white/10"
        >
          Reset
        </button>
      </div>
      
      <p className="mt-3 text-center text-[11px] text-indigo-200">
        25 minutes of uninterrupted progress
      </p>
    </section>
  ); 
}
