import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { HiCalendarDays, HiClipboardDocumentCheck, HiCog6Tooth, HiDocumentText, HiHome, HiMiniArrowRightOnRectangle, HiUserCircle, HiXMark, HiBars3, HiChevronLeft, HiChevronRight, HiArrowPath } from 'react-icons/hi2';
import { useAuth } from '../context/AuthContext'; 
import { useState } from 'react';
import PersistentTimer from './PersistentTimer';

const links = [
  ['/', 'Dashboard', HiHome],
  ['/tasks', 'My Tasks', HiClipboardDocumentCheck],
  ['/permanent', 'Permanent Tasks', HiArrowPath],
  ['/calendar', 'Calendar', HiCalendarDays],
  ['/notes', 'Notes', HiDocumentText],
  ['/profile', 'Profile', HiUserCircle],
  ['/settings', 'Settings', HiCog6Tooth]
];

export default function Layout() {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const close = () => setOpen(false);

  const sidebar = (
    <aside className={`flex h-full flex-col bg-slate-950 px-3 py-6 text-slate-300 transition-all duration-300 ${expanded ? 'w-72' : 'w-20'} overflow-x-hidden`}>
      <div className={`mb-9 flex items-center px-1 ${expanded ? 'justify-between' : 'justify-center'}`}>
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-indigo-500 text-lg font-black text-white">S</div>
          {expanded && (
            <div className="min-w-0">
              <strong className="block truncate text-white">SmartPlan</strong>
              <p className="truncate text-xs text-slate-500">Student Planner</p>
            </div>
          )}
        </div>
        {expanded && (
          <button onClick={() => setExpanded(false)} className="hidden lg:block text-slate-500 hover:text-white p-1">
            <HiChevronLeft className="text-xl" />
          </button>
        )}
      </div>

      {!expanded && (
        <button onClick={() => setExpanded(true)} className="hidden lg:flex mb-6 mx-auto text-slate-500 hover:text-white justify-center w-full">
          <HiChevronRight className="text-xl" />
        </button>
      )}

      <nav className="space-y-1">
        {links.map(([to, label, Icon]) => (
          <NavLink 
            end={to === '/'} 
            onClick={close} 
            key={to} 
            to={to} 
            title={!expanded ? label : undefined}
            className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${isActive ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'hover:bg-slate-800 hover:text-white'} ${expanded ? '' : 'justify-center'}`}
          >
            <Icon className="text-xl shrink-0" />
            {expanded && <span className="truncate">{label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className={`mt-auto rounded-2xl bg-slate-900 ${expanded ? 'p-3' : 'p-2 flex flex-col items-center'}`}>
        <div className={`flex items-center gap-2 ${expanded ? '' : 'justify-center'}`}>
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-indigo-400 font-bold text-white">
            {user?.name?.[0] || 'S'}
          </div>
          {expanded && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">{user?.name}</p>
              <p className="truncate text-xs text-slate-500">{user?.email}</p>
            </div>
          )}
        </div>
        <button 
          onClick={() => { logout(); nav('/login'); }} 
          title={!expanded ? "Sign out" : undefined}
          className={`mt-3 flex items-center gap-2 text-xs text-slate-400 hover:text-white ${expanded ? '' : 'justify-center w-full'}`}
        >
          <HiMiniArrowRightOnRectangle className="text-lg shrink-0" />
          {expanded && <span>Sign out</span>}
        </button>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#101827]">
      <div className="fixed inset-y-0 left-0 z-50 hidden lg:block">{sidebar}</div>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-slate-950/50" onClick={close} />
          <div className="relative h-full">
            {sidebar}
            <button onClick={close} className="absolute right-4 top-6 text-white"><HiXMark className="text-xl" /></button>
          </div>
        </div>
      )}
      <main className={`transition-all duration-300 ${expanded ? 'lg:ml-72' : 'lg:ml-20'} min-h-screen lg:h-screen lg:overflow-y-auto flex flex-col`}>
        <div className="lg:hidden sticky top-0 z-30 flex h-14 items-center justify-between border-b border-slate-200/70 bg-slate-50/80 px-4 backdrop-blur dark:border-slate-700 dark:bg-[#101827]/85 shrink-0">
          <button onClick={() => setOpen(true)} className="p-2 text-slate-600 dark:text-slate-300">
            <HiBars3 className="text-2xl" />
          </button>
          <PersistentTimer />
        </div>
        <div className="hidden lg:flex mx-auto w-full max-w-7xl items-center justify-end px-5 pt-3 sm:px-8 shrink-0">
          <PersistentTimer />
        </div>
        <div className="mx-auto w-full max-w-7xl px-5 pt-2 pb-4 sm:px-8 sm:pt-2 sm:pb-5 flex-1 min-h-0 flex flex-col">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
