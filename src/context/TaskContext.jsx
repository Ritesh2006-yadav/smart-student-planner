import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { localDateString } from '../utils/date';
const TaskContext = createContext();
const expirePastTasks = (items, today = localDateString()) => {
  let changed = false;
  const updated = items.map((task) => {
    if (!task.completed && task.dueDate && task.dueDate < today && task.status !== 'incomplete') {
      changed = true;
      return { ...task, status: 'incomplete', incompleteAt: Date.now() };
    }
    return task;
  });
  return changed ? updated : items;
};

export const TaskProvider = ({ children }) => {
  // New planners start with no tasks; every task is created by the user.
  const [tasks, setTasks] = useState(() => {
    const savedTasks = JSON.parse(localStorage.getItem('ssp-tasks')) || [];
    // Remove the sample records included by an earlier version of the planner.
    return expirePastTasks(savedTasks.filter(task => !['1', '2', '3'].includes(task.id)));
  });
  const [notes, setNotes] = useState(() => JSON.parse(localStorage.getItem('ssp-notes')) || [{ id: 'n1', title: 'Welcome to your planner', body: 'Keep your ideas, quick reminders, and study notes here.', updatedAt: Date.now() }]);
  useEffect(() => localStorage.setItem('ssp-tasks', JSON.stringify(tasks)), [tasks]); useEffect(() => localStorage.setItem('ssp-notes', JSON.stringify(notes)), [notes]);
  // Re-check on app resume and at midnight so the 24-hour cycle also works
  // while the planner remains open overnight.
  useEffect(() => {
    const updateExpiredTasks = () => setTasks(current => expirePastTasks(current));
    const scheduleMidnightCheck = () => {
      const nextMidnight = new Date();
      nextMidnight.setHours(24, 0, 1, 0);
      return window.setTimeout(() => {
        updateExpiredTasks();
        timeoutId = scheduleMidnightCheck();
      }, nextMidnight.getTime() - Date.now());
    };
    let timeoutId = scheduleMidnightCheck();
    const onResume = () => updateExpiredTasks();
    window.addEventListener('focus', onResume);
    document.addEventListener('visibilitychange', onResume);
    return () => {
      window.clearTimeout(timeoutId);
      window.removeEventListener('focus', onResume);
      document.removeEventListener('visibilitychange', onResume);
    };
  }, []);
  const addTask = t => setTasks(x => expirePastTasks([{ ...t, id: crypto.randomUUID(), createdAt: Date.now(), completed: false, status: 'active' }, ...x]));
  const updateTask = (id, changes) => setTasks(x => expirePastTasks(x.map((task) => {
    if (task.id !== id) return task;
    const updated = { ...task, ...changes };
    return {
      ...updated,
      // Rescheduling an incomplete task to today or a future date reopens it.
      status: updated.completed || updated.dueDate >= localDateString() ? 'active' : updated.status,
    };
  })));
  const removeTask = id => setTasks(x => x.filter(t => t.id !== id));
  const stats = useMemo(() => {
    const today = localDateString();
    return {
      total: tasks.length,
      completed: tasks.filter(t => t.completed).length,
      incomplete: tasks.filter(t => t.status === 'incomplete').length,
      pending: tasks.filter(t => !t.completed && t.status !== 'incomplete').length,
      dueToday: tasks.filter(t => !t.completed && t.status !== 'incomplete' && t.dueDate === today).length,
    };
  }, [tasks]);
  return <TaskContext.Provider value={{ tasks, notes, stats, addTask, updateTask, removeTask, setNotes }}>{children}</TaskContext.Provider>;
};
export const useTasks = () => useContext(TaskContext);
