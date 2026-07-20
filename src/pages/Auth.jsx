import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HiAcademicCap, HiEye, HiEyeSlash } from 'react-icons/hi2';
import { useAuth } from '../context/AuthContext';

export default function Auth({ register = false }) {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const { login, updateProfile } = useAuth();
  const navigate = useNavigate();
  const update = (key, value) => setForm({ ...form, [key]: value });

  const submit = (event) => {
    event.preventDefault();
    if (register && !form.name.trim()) return setError('Please enter your name.');
    if (!/^[^\s@]+@gmail\.com$/i.test(form.email)) return setError('Please use a valid @gmail.com address.');
    if (form.password.length < 8) return setError('Password must be at least 8 characters.');
    login(form.email);
    if (register) updateProfile({ name: form.name.trim() });
    navigate('/');
  };

  return <div className="grid min-h-screen bg-slate-50 dark:bg-[#101827] lg:grid-cols-2">
    <aside className="hidden flex-col bg-gradient-to-br from-indigo-700 via-indigo-600 to-violet-700 p-12 text-white lg:flex">
      <div className="flex items-center gap-3 text-xl font-bold"><HiAcademicCap className="text-3xl" />SmartPlan</div>
      <div className="my-auto"><h1 className="max-w-lg text-5xl font-bold leading-tight">Plan smarter.<br />Study better.</h1><p className="mt-5 max-w-md text-lg text-indigo-100">A focused space for your tasks, study sessions, deadlines, and ideas.</p></div>
    </aside>
    <main className="flex items-center justify-center p-5"><form onSubmit={submit} className="w-full max-w-md animate-fade-up">
      <div className="mb-10 lg:hidden"><div className="flex items-center gap-2 text-xl font-bold text-indigo-600"><HiAcademicCap className="text-3xl" />SmartPlan</div></div>
      <p className="text-4xl font-bold tracking-wide text-indigo-600">WELCOME {register ? 'IN' : 'BACK'}</p>
      <h1 className="mt-2 text-3xl font-bold">{register ? 'Create your account' : 'Sign in to your planner'}</h1>
      <p className="mt-2 text-slate-500">{register ? 'Start organizing your best semester yet.' : 'Pick up right where you left off.'}</p>
      <div className="mt-8 space-y-5">
        {register && <div><label className="label">Full name</label><input className="field" placeholder="Alex Johnson" value={form.name} onChange={e => update('name', e.target.value)} /></div>}
        <div><label className="label">Gmail address</label><input className="field" type="email" placeholder="you@gmail.com" value={form.email} onChange={e => update('email', e.target.value)} /></div>
        <div><label className="label">Password</label><div className="relative"><input className="field pr-10" type={show ? 'text' : 'password'} placeholder="At least 8 characters" value={form.password} onChange={e => update('password', e.target.value)} /><button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-3 text-slate-400">{show ? <HiEyeSlash /> : <HiEye />}</button></div></div>
        {error && <p className="text-sm text-rose-500">{error}</p>}<button className="btn-primary w-full">{register ? 'Create account' : 'Sign in'}</button>
      </div>
      <p className="mt-6 text-center text-sm text-slate-500">{register ? 'Already have an account?' : 'New here?'} <Link className="font-semibold text-indigo-600" to={register ? '/login' : '/register'}>{register ? 'Sign in' : 'Create an account'}</Link></p>
    </form></main>
  </div>;
}
