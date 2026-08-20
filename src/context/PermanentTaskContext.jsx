import { createContext, useContext, useEffect, useState } from 'react';
import { localDateString, parseLocalDate } from '../utils/date';

const PermanentTaskContext = createContext();

export const PermanentTaskProvider = ({ children }) => {
  // Store templates
  const [permanentTasks, setPermanentTasks] = useState(() => {
    return JSON.parse(localStorage.getItem('ssp-permanent-tasks')) || [];
  });

  // Store completions as an array of objects: { taskId, date: 'YYYY-MM-DD' }
  const [completions, setCompletions] = useState(() => {
    return JSON.parse(localStorage.getItem('ssp-permanent-completions')) || [];
  });

  // Explicit "not completed" choices are kept separately from automatic
  // missed-day detection, so they remain attached to the selected occurrence.
  const [incompletions, setIncompletions] = useState(() => {
    return JSON.parse(localStorage.getItem('ssp-permanent-incompletions')) || [];
  });

  useEffect(() => {
    localStorage.setItem('ssp-permanent-tasks', JSON.stringify(permanentTasks));
  }, [permanentTasks]);

  useEffect(() => {
    localStorage.setItem('ssp-permanent-completions', JSON.stringify(completions));
  }, [completions]);

  useEffect(() => {
    localStorage.setItem('ssp-permanent-incompletions', JSON.stringify(incompletions));
  }, [incompletions]);

  const addPermanentTask = (task) => {
    setPermanentTasks((prev) => [
      ...prev,
      {
        ...task,
        id: 'perm-' + crypto.randomUUID(),
        createdAt: Date.now(),
        enabled: true,
      },
    ]);
  };

  const updatePermanentTask = (id, changes) => {
    setPermanentTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...changes } : t)));
  };

  const removePermanentTask = (id) => {
    setPermanentTasks((prev) => prev.filter((t) => t.id !== id));
    // Optionally clean up completions
    setCompletions((prev) => prev.filter((c) => c.taskId !== id));
    setIncompletions((prev) => prev.filter((item) => item.taskId !== id));
  };

  const togglePermanentTaskCompletion = (taskId, date) => {
    const exists = completions.some((item) => item.taskId === taskId && item.date === date);
    setCompletions((prev) => exists
      ? prev.filter((item) => !(item.taskId === taskId && item.date === date))
      : [...prev, { taskId, date }]);
    if (!exists) {
      setIncompletions((items) => items.filter((item) => !(item.taskId === taskId && item.date === date)));
    }
  };

  const markPermanentTaskIncomplete = (taskId, date) => {
    setCompletions((prev) => prev.filter((item) => !(item.taskId === taskId && item.date === date)));
    setIncompletions((prev) => prev.some((item) => item.taskId === taskId && item.date === date)
      ? prev
      : [...prev, { taskId, date }]);
  };

  // Helper to generate instances for a specific date
  const getPermanentTasksForDate = (dateString) => {
    const targetDate = parseLocalDate(dateString);
    const dayOfWeek = targetDate.getDay(); // 0 (Sun) to 6 (Sat)
    const dayOfMonth = targetDate.getDate();

    // Strip time for exact date comparison
    targetDate.setHours(0, 0, 0, 0);

    const instances = [];

    permanentTasks.forEach((task) => {
      if (!task.enabled) return;

      if (task.startDate) {
        const start = parseLocalDate(task.startDate);
        start.setHours(0, 0, 0, 0);
        if (targetDate < start) return;
      }

      if (task.endDate) {
        const end = parseLocalDate(task.endDate);
        end.setHours(0, 0, 0, 0);
        if (targetDate > end) return;
      }

      let matches = false;

      if (task.repeatFrequency === 'daily') {
        matches = true;
      } else if (task.repeatFrequency === 'weekly') {
        const start = task.startDate ? parseLocalDate(task.startDate) : new Date();
        matches = start.getDay() === dayOfWeek;
      } else if (task.repeatFrequency === 'monthly') {
        const start = task.startDate ? parseLocalDate(task.startDate) : new Date();
        matches = start.getDate() === dayOfMonth;
      } else if (task.repeatFrequency === 'custom' && task.customDays) {
        matches = task.customDays.includes(dayOfWeek);
      }

      if (matches) {
        const isCompleted = completions.some(
          (c) => c.taskId === task.id && c.date === dateString
        );
        const isExplicitlyIncomplete = incompletions.some(
          (item) => item.taskId === task.id && item.date === dateString
        );
        instances.push({
          ...task,
          dueDate: dateString, // Set the due date to the target date
          completed: isCompleted,
          // This is intentionally derived rather than stored: a task only becomes
          // missed once its own scheduled day has ended, and stays tied to that day.
          isMissed: !isCompleted && (isExplicitlyIncomplete || dateString < localDateString()),
          status: !isCompleted && (isExplicitlyIncomplete || dateString < localDateString()) ? 'incomplete' : 'active',
          isPermanent: true, // Flag to identify it's a generated task
        });
      }
    });

    return instances;
  };

  return (
    <PermanentTaskContext.Provider
      value={{
        permanentTasks,
        completions,
        incompletions,
        addPermanentTask,
        updatePermanentTask,
        removePermanentTask,
        togglePermanentTaskCompletion,
        markPermanentTaskIncomplete,
        getPermanentTasksForDate,
      }}
    >
      {children}
    </PermanentTaskContext.Provider>
  );
};

export const usePermanentTasks = () => useContext(PermanentTaskContext);
