// components/Toast.jsx – lightweight toast notifications
import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

// ── Context ──
const ToastContext = createContext(null);

let _addToast = null;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration);
  }, []);

  // Expose imperatively (useful outside React tree)
  _addToast = addToast;

  const remove = (id) => setToasts(prev => prev.filter(t => t.id !== id));

  const iconMap = {
    success: <CheckCircle size={16} />,
    error:   <XCircle size={16} />,
    info:    <Info size={16} />,
  };
  const colorMap = {
    success: { bg: 'rgba(124,140,104,0.12)', border: 'rgba(124,140,104,0.35)', color: '#7C8C68' },
    error:   { bg: 'rgba(166,93,87,0.10)',  border: 'rgba(166,93,87,0.30)',  color: '#A65D57' },
    info:    { bg: 'rgba(170,132,114,0.10)', border: 'rgba(170,132,114,0.30)', color: '#AA8472' },
  };

  return (
    <ToastContext.Provider value={addToast}>
      {children}
      {/* Portal-like fixed container */}
      <div style={{ position: 'fixed', bottom: 96, right: 20, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <AnimatePresence>
          {toasts.map(t => {
            const c = colorMap[t.type] || colorMap.info;
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, x: 60, scale: 0.92 }}
                animate={{ opacity: 1, x: 0,  scale: 1    }}
                exit={{    opacity: 0, x: 60, scale: 0.92 }}
                transition={{ type: 'spring', damping: 22, stiffness: 280 }}
                style={{
                  background: c.bg,
                  border: `1px solid ${c.border}`,
                  borderRadius: 14,
                  padding: '11px 16px',
                  display: 'flex', alignItems: 'center', gap: 10,
                  maxWidth: 320, minWidth: 220,
                  backdropFilter: 'blur(12px)',
                  boxShadow: '0 8px 24px rgba(74,59,51,0.12)',
                  color: c.color,
                }}
              >
                {iconMap[t.type]}
                <span style={{
                  flex: 1,
                  fontFamily: 'var(--font-body)', fontSize: '0.875rem',
                  fontWeight: 500, color: 'var(--text-primary)',
                }}>
                  {t.message}
                </span>
                <button onClick={() => remove(t.id)} style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--text-muted)', padding: 2, flexShrink: 0,
                }}>
                  <X size={13} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

// ── Hook ──
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be inside <ToastProvider>');
  return ctx;
}

// ── Imperative helper (usable outside components) ──
export const toast = {
  success: (msg) => _addToast?.(msg, 'success'),
  error:   (msg) => _addToast?.(msg, 'error'),
  info:    (msg) => _addToast?.(msg, 'info'),
};
