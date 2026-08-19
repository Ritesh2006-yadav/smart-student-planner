import { useEffect, useState } from 'react';

const empty = {
  title: '',
  description: '',
  priority: 'medium',
  category: 'General',
  repeatFrequency: 'daily',
  customDays: [],
  startDate: new Date().toISOString().slice(0, 10),
  endDate: '',
};

const daysOfWeek = [
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' },
  { value: 0, label: 'Sun' },
];

export default function PermanentTaskForm({ task, onSave, onClose }) {
  const [form, setForm] = useState(task || empty);
  const [errors, setErrors] = useState({});

  useEffect(() => setForm(task || empty), [task]);

  const submit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return setErrors({ title: 'A task title is required.' });
    if (form.repeatFrequency === 'custom' && form.customDays.length === 0) {
      return setErrors({ customDays: 'Select at least one day.' });
    }
    onSave({ ...form, title: form.title.trim() });
  };

  const toggleDay = (dayValue) => {
    setForm((prev) => {
      const isSelected = prev.customDays.includes(dayValue);
      return {
        ...prev,
        customDays: isSelected
          ? prev.customDays.filter((d) => d !== dayValue)
          : [...prev.customDays, dayValue],
      };
    });
    setErrors({});
  };

  return (
    <form onSubmit={submit} className="space-y-4 pb-1">
      <div>
        <label className="label">Task title</label>
        <input
          autoFocus
          className="field"
          placeholder="e.g. Go to Gym"
          value={form.title}
          onChange={(e) => {
            setForm({ ...form, title: e.target.value });
            setErrors({});
          }}
        />
        {errors.title && <p className="mt-1 text-xs text-rose-500">{errors.title}</p>}
      </div>
      <div>
        <label className="label">
          Description <span className="text-slate-400">(optional)</span>
        </label>
        <textarea
          className="field min-h-20 resize-none"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">Repeat Frequency</label>
          <select
            className="field"
            value={form.repeatFrequency}
            onChange={(e) => setForm({ ...form, repeatFrequency: e.target.value })}
          >
            <option value="daily">Every day</option>
            <option value="weekly">Every week</option>
            <option value="monthly">Every month</option>
            <option value="custom">Custom days</option>
          </select>
        </div>
        <div>
          <label className="label">Category</label>
          <input
            className="field"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          />
        </div>
      </div>

      {form.repeatFrequency === 'custom' && (
        <div>
          <label className="label">Select Days</label>
          <div className="flex flex-wrap gap-2 mt-1">
            {daysOfWeek.map((day) => {
              const isSelected = form.customDays.includes(day.value);
              return (
                <button
                  type="button"
                  key={day.value}
                  onClick={() => toggleDay(day.value)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border ${
                    isSelected
                      ? 'bg-indigo-500 border-indigo-500 text-white'
                      : 'bg-white border-slate-300 text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'
                  }`}
                >
                  {day.label}
                </button>
              );
            })}
          </div>
          {errors.customDays && (
            <p className="mt-1 text-xs text-rose-500">{errors.customDays}</p>
          )}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="label">Priority</label>
          <select
            className="field"
            value={form.priority}
            onChange={(e) => setForm({ ...form, priority: e.target.value })}
          >
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
        <div>
          <label className="label">Start date</label>
          <input
            className="field"
            type="date"
            value={form.startDate}
            onChange={(e) => setForm({ ...form, startDate: e.target.value })}
          />
        </div>
        <div>
          <label className="label">End date (optional)</label>
          <input
            className="field"
            type="date"
            value={form.endDate}
            onChange={(e) => setForm({ ...form, endDate: e.target.value })}
          />
        </div>
      </div>
      <div className="flex flex-col-reverse justify-end gap-3 pt-2 sm:flex-row">
        <button type="button" className="btn-secondary" onClick={onClose}>
          Cancel
        </button>
        <button className="btn-primary">
          {task ? 'Save changes' : 'Create task'}
        </button>
      </div>
    </form>
  );
}
