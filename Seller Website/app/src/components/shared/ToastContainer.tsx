import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useStore } from '@/store/useStore';

const iconMap = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const borderColorMap = {
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#00D4FF',
};

export function ToastContainer() {
  const { toasts, removeToast } = useStore();

  return (
    <div className="fixed top-20 right-6 z-[110] flex flex-col gap-3 max-w-[380px]">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function ToastItem({ toast, onRemove }: { toast: { id: string; message: string; type: string }; onRemove: (id: string) => void }) {
  const Icon = iconMap[toast.type as keyof typeof iconMap] || Info;
  const borderColor = borderColorMap[toast.type as keyof typeof borderColorMap] || '#00D4FF';

  useEffect(() => {
    const timer = setTimeout(() => onRemove(toast.id), 5000);
    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 100, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="flex items-start gap-3 p-4 rounded-lg bg-[#0D1233] border border-white/[0.06] shadow-lg"
      style={{ borderLeft: `3px solid ${borderColor}` }}
    >
      <Icon size={18} style={{ color: borderColor }} className="flex-shrink-0 mt-0.5" />
      <p className="text-sm text-white/90 flex-1">{toast.message}</p>
      <button
        onClick={() => onRemove(toast.id)}
        className="text-white/40 hover:text-white transition-colors flex-shrink-0"
      >
        <X size={14} />
      </button>
    </motion.div>
  );
}
