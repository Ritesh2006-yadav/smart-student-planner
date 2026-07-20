import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const { toast } = useToast();
  const { dark, toggleTheme } = useTheme();
  const [form, setForm] = useState({ name: user.name, email: user.email });

  return (
    <div className="mx-auto max-w-3xl space-y-6 animate-fade-up">
      <div>
        <h1 className="text-3xl font-bold">Your profile</h1>
        <p className="mt-1 text-slate-500">Keep your planner personal.</p>
      </div>
      
      <div className="card p-6 sm:p-8">
        <div className="mb-8 flex items-center gap-4">
          <div className="grid h-16 w-16 place-items-center rounded-2xl bg-indigo-100 text-2xl font-bold text-indigo-600 dark:bg-indigo-500/20">
            {form.name[0]}
          </div>
          <div>
            <h2 className="font-bold">{form.name}</h2>
            <p className="text-sm text-slate-500">Student account</p>
          </div>
        </div>
        
        <form onSubmit={e => { e.preventDefault(); updateProfile(form); toast('Profile saved successfully.'); }} className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="label">Display name</label>
            <input required className="field" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="label">Email address</label>
            <input required type="email" className="field" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="sm:col-span-2">
            <button className="btn-primary">Save changes</button>
          </div>
        </form>
      </div>

      <div className="card p-6 sm:p-8 flex items-center justify-between gap-5">
        <div>
          <h2 className="font-bold">Dark mode</h2>
          <p className="mt-1 text-sm text-slate-500">Use a darker, easier-on-the-eyes appearance.</p>
        </div>
        <button 
          aria-label="Toggle dark mode" 
          onClick={toggleTheme} 
          className={`relative h-7 w-12 rounded-full transition ${dark ? 'bg-indigo-600' : 'bg-slate-300'}`}
        >
          <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${dark ? 'left-6' : 'left-1'}`} />
        </button>
      </div>
    </div>
  );
}
