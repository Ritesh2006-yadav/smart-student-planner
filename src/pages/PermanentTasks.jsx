import { useState } from 'react';
import { HiPlus, HiPencil, HiTrash, HiCheck } from 'react-icons/hi2';
import { usePermanentTasks } from '../context/PermanentTaskContext';
import PermanentTaskForm from '../components/PermanentTaskForm';
import Modal from '../components/Modal';
import { useToast } from '../context/ToastContext';

export default function PermanentTasks() {
  const { permanentTasks, addPermanentTask, updatePermanentTask, removePermanentTask } = usePermanentTasks();
  const { toast } = useToast();
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);

  const save = (t) => {
    if (editing) {
      updatePermanentTask(editing.id, t);
      toast('Permanent task updated successfully.');
    } else {
      addPermanentTask(t);
      toast('Permanent task created successfully.');
    }
    setModal(false);
    setEditing(null);
  };

  const getFrequencyLabel = (task) => {
    switch (task.repeatFrequency) {
      case 'daily': return 'Every day';
      case 'weekly': return 'Every week';
      case 'monthly': return 'Every month';
      case 'custom': 
        if (!task.customDays || task.customDays.length === 0) return 'Custom days';
        const dayMap = {0: 'Sun', 1: 'Mon', 2: 'Tue', 3: 'Wed', 4: 'Thu', 5: 'Fri', 6: 'Sat'};
        return task.customDays.map(d => dayMap[d]).join(', ');
      default: return 'Unknown';
    }
  };

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Permanent Tasks</h1>
          <p className="mt-1 text-slate-500">Manage your recurring tasks and habits.</p>
        </div>
        <button onClick={() => setModal(true)} className="btn-primary">
          <HiPlus /> Add Task
        </button>
      </div>

      {permanentTasks.length === 0 ? (
        <div className="card p-10 text-center text-slate-500">
          <p>No permanent tasks yet. Create one to automatically populate your daily plan!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {permanentTasks.map(t => (
            <div key={t.id} className={`card min-w-0 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-l-4 ${t.enabled ? 'border-l-indigo-500' : 'border-l-slate-300 opacity-60'}`}>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-lg flex items-center gap-2">
                  {t.title}
                  {!t.enabled && <span className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-500 text-xs font-medium">Disabled</span>}
                </h3>
                {t.description && <p className="mt-1 break-words text-sm text-slate-500">{t.description}</p>}
                
                <div className="flex flex-wrap gap-3 mt-3 text-xs text-slate-500 font-medium">
                  <span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                    Repeat: {getFrequencyLabel(t)}
                  </span>
                  <span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                    Category: {t.category}
                  </span>
                  <span className={`px-2 py-1 rounded ${
                    t.priority === 'high' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30' : 
                    t.priority === 'medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30' : 
                    'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30'
                  }`}>
                    Priority: {t.priority}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end shrink-0 sm:self-auto">
                <button 
                  onClick={() => updatePermanentTask(t.id, { enabled: !t.enabled })}
                  className={`p-2 rounded-lg transition-colors ${t.enabled ? 'text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                  title={t.enabled ? "Disable task" : "Enable task"}
                >
                  <HiCheck className="text-xl" />
                </button>
                <button 
                  onClick={() => { setEditing(t); setModal(true); }}
                  className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                  title="Edit task"
                >
                  <HiPencil className="text-xl" />
                </button>
                <button 
                  onClick={() => {
                    if(confirm('Are you sure you want to delete this permanent task?')) {
                      removePermanentTask(t.id);
                      toast('Task deleted', 'info');
                    }
                  }}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors"
                  title="Delete task"
                >
                  <HiTrash className="text-xl" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <Modal title={editing ? 'Edit permanent task' : 'Create permanent task'} onClose={() => { setModal(false); setEditing(null); }}>
          <PermanentTaskForm task={editing} onSave={save} onClose={() => { setModal(false); setEditing(null); }} />
        </Modal>
      )}
    </div>
  );
}
