import { createContext, useContext, useState } from 'react';
import { HiCheckCircle, HiExclamationCircle, HiInformationCircle, HiXMark } from 'react-icons/hi2';
const ToastContext = createContext();
const icons = { success: HiCheckCircle, error: HiExclamationCircle, info: HiInformationCircle };
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const toast = (message, type = 'success') => { const id = Date.now(); setToasts(t => [...t, { id, message, type }]); setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3000); };
  return <ToastContext.Provider value={{ toast }}>{children}<div className="fixed right-4 top-4 z-[100] space-y-2">{toasts.map(t => { const Icon = icons[t.type]; return <div key={t.id} className="flex w-80 items-center gap-3 rounded-xl bg-slate-900 px-4 py-3 text-sm text-white shadow-xl animate-fade-up"><Icon className={t.type === 'error' ? 'text-rose-400' : 'text-emerald-400'} /><span className="flex-1">{t.message}</span><button onClick={() => setToasts(x => x.filter(i => i.id !== t.id))}><HiXMark /></button></div>; })}</div></ToastContext.Provider>;
};
export const useToast = () => useContext(ToastContext);
