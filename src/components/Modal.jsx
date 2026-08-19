import { HiXMark } from 'react-icons/hi2';

// The overlay owns page scrolling, keeping the dialog reachable at every zoom level.
export default function Modal({ title, children, onClose }) {
  return <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-slate-950/55 p-3 sm:p-6">
    <section role="dialog" aria-modal="true" aria-label={title} className="card flex max-h-[calc(100dvh-1.5rem)] w-full max-w-xl flex-col overflow-hidden p-5 shadow-2xl animate-fade-up sm:max-h-[calc(100dvh-3rem)] sm:p-6">
      <div className="mb-5 flex items-center justify-between gap-4">
        <h2 className="text-lg font-bold">{title}</h2>
        <button onClick={onClose} aria-label="Close dialog" className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-800 dark:hover:bg-slate-700"><HiXMark className="text-xl" /></button>
      </div>
      <div className="min-h-0 overflow-y-auto pr-1">{children}</div>
    </section>
  </div>;
}
