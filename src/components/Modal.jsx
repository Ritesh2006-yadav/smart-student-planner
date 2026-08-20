import { useEffect } from 'react';
import { HiXMark } from 'react-icons/hi2';

// The overlay owns page scrolling, keeping the dialog reachable at every zoom level.
export default function Modal({ title, children, onClose }) {
  useEffect(() => {
    const originalBodyOverflow = document.body.style.overflow;
    const originalRootOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalRootOverflow;
    };
  }, []);

  return <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/60 p-3 backdrop-blur-[1px] sm:p-6">
    <section role="dialog" aria-modal="true" aria-label={title} className="card flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden p-5 shadow-2xl animate-fade-up sm:p-6">
      <div className="mb-5 flex shrink-0 items-center justify-between gap-4">
        <h2 className="text-lg font-bold">{title}</h2>
        <button onClick={onClose} aria-label="Close dialog" className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-800 dark:hover:bg-slate-700"><HiXMark className="text-xl" /></button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1">{children}</div>
    </section>
  </div>;
}
