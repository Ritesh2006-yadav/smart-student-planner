import { createContext, useContext, useEffect, useMemo, useState } from 'react';
const TaskContext = createContext();
const today = new Date().toISOString().slice(0, 10);
export const TaskProvider = ({ children }) => {
  // New planners start with no tasks; every task is created by the user.
  const [tasks, setTasks] = useState(() => {
    const savedTasks = JSON.parse(localStorage.getItem('ssp-tasks')) || [];
    // Remove the sample records included by an earlier version of the planner.
    return savedTasks.filter(task => !['1', '2', '3'].includes(task.id));
  });
  const [notes, setNotes] = useState(() => JSON.parse(localStorage.getItem('ssp-notes')) || [{ id: 'n1', title: 'Welcome to your planner', body: 'Keep your ideas, quick reminders, and study notes here.', updatedAt: Date.now() }]);
  useEffect(() => localStorage.setItem('ssp-tasks', JSON.stringify(tasks)), [tasks]); useEffect(() => localStorage.setItem('ssp-notes', JSON.stringify(notes)), [notes]);
  const addTask = t => setTasks(x => [{ ...t, id: crypto.randomUUID(), createdAt: Date.now(), completed: false }, ...x]);
  const updateTask = (id, changes) => setTasks(x => x.map(t => t.id === id ? { ...t, ...changes } : t));
  const removeTask = id => setTasks(x => x.filter(t => t.id !== id));
  const stats = useMemo(() => ({ total: tasks.length, completed: tasks.filter(t => t.completed).length, pending: tasks.filter(t => !t.completed).length, dueToday: tasks.filter(t => !t.completed && t.dueDate === today).length }), [tasks]);
  return <TaskContext.Provider value={{ tasks, notes, stats, addTask, updateTask, removeTask, setNotes }}>{children}</TaskContext.Provider>;
};
export const useTasks = () => useContext(TaskContext);
