import { useEffect } from 'react';

export default function Toast({ toast, onClose }) {
  // toast: { id, message, type }
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => {
      onClose && onClose(toast.id);
    }, 3500);
    return () => clearTimeout(t);
  }, [toast, onClose]);

  if (!toast) return null;

  const bg = toast.type === 'error' ? 'bg-red-500' : 'bg-green-600';

  return (
    <div className="fixed right-4 bottom-6 z-50">
      <div className={`text-white px-4 py-2 rounded shadow-md ${bg}`}>
        {toast.message}
      </div>
    </div>
  );
}
