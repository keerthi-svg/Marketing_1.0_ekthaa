// CreatePostModal.jsx – connected to backend + draft autosave
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AvatarRing from './AvatarRing';
import { useAuth }  from '../context/AuthContext';
import { useToast } from './Toast';
import api          from '../services/api';
import { X, PenLine, Check } from 'lucide-react';

const MAX_CHARS = 280;
const DRAFT_KEY = 'ekthaa_draft';

function useWindowSize() {
  const [size, setSize] = useState(() => ({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800
  }));
  useEffect(() => {
    const handleResize = () => setSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return size;
}

export default function CreatePostModal({ isOpen, onClose, onPost }) {
  const [text,       setText]       = useState(() => localStorage.getItem(DRAFT_KEY) || '');
  const [publishing, setPublishing] = useState(false);
  const [success,    setSuccess]    = useState(false);

  const { user }   = useAuth();
  const addToast   = useToast();
  const { width }  = useWindowSize();
  const isMobile   = width < 768;
  const isTablet   = width >= 768 && width < 1024;

  // ── Draft autosave ──
  useEffect(() => {
    if (text) {
      localStorage.setItem(DRAFT_KEY, text);
    } else {
      localStorage.removeItem(DRAFT_KEY);
    }
  }, [text]);

  // ── Lock body scroll when open ──
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  const remaining  = MAX_CHARS - text.length;
  const isOver     = remaining < 0;
  const progress   = Math.min(text.length / MAX_CHARS, 1);
  const circ       = 2 * Math.PI * 11;
  const ringColor  = isOver ? 'var(--color-error)' : progress > 0.8 ? 'var(--color-warning)' : 'var(--color-primary)';

  // ── Publish: POST to backend, then optimistic insert ──
  const handlePublish = async () => {
    if (!text.trim() || isOver) return;
    setPublishing(true);
    try {
      const { data } = await api.post('/posts', { content: text });

      if (data.success) {
        setSuccess(true);
        // Optimistic insert into Home feed via custom event
        window.dispatchEvent(new CustomEvent('ekthaa:new-post', { detail: data.post }));
        addToast('Entry published! +10 XP ⚡', 'success');
        localStorage.removeItem(DRAFT_KEY);
        onPost?.({ content: text });
        await new Promise(r => setTimeout(r, 900));
        setSuccess(false);
        setText('');
        onClose?.();
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setPublishing(false);
    }
  };

  const modalVariants = isMobile ? {
    initial: { y: '100%', opacity: 1 },
    animate: { y: 0, opacity: 1 },
    exit:    { y: '100%', opacity: 1 }
  } : {
    initial: { opacity: 0, y: 36, scale: 0.96 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit:    { opacity: 0, y: 36, scale: 0.96 }
  };

  const modalStyle = isMobile ? {
    position: 'fixed',
    bottom: 0, left: 0, right: 0,
    width: '100%', height: '88vh',
    background: 'var(--bg-card)',
    borderRadius: '24px 24px 0 0',
    padding: '20px 20px calc(20px + env(safe-area-inset-bottom)) 20px',
    zIndex: 101, boxShadow: '0 -10px 40px rgba(74,59,51,0.12)',
    display: 'flex', flexDirection: 'column', overflow: 'hidden',
  } : {
    position: 'fixed',
    top: '50%', left: '50%',
    x: '-50%', y: '-50%',
    width: isTablet ? '90%' : '660px',
    maxHeight: '80vh',
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 28,
    padding: '30px 32px 24px',
    zIndex: 101,
    boxShadow: '0 24px 80px rgba(74,59,51,0.16)',
    display: 'flex', flexDirection: 'column',
  };

  const draftBadge = localStorage.getItem(DRAFT_KEY) && (
    <span style={{
      fontSize: '0.72rem', fontFamily: 'var(--font-body)',
      color: 'var(--color-warning)', background: 'rgba(198,139,93,0.1)',
      border: '1px solid rgba(198,139,93,0.25)',
      borderRadius: 99, padding: '2px 8px', marginLeft: 8, fontWeight: 600,
    }}>Draft saved</span>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            id="create-post-backdrop"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            style={{ position: 'fixed', inset: 0, background: 'var(--bg-overlay)', backdropFilter: 'blur(8px)', zIndex: 100 }}
          />

          <motion.div
            id="create-post-modal"
            variants={modalVariants}
            initial="initial" animate="animate" exit="exit"
            transition={{ type: 'spring', damping: 28, stiffness: 300, mass: 0.8 }}
            style={modalStyle}
          >
            {isMobile ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                  <button onClick={onClose} style={{ background: 'none', border: 'none', padding: 4, margin: -4, color: 'var(--text-primary)', cursor: 'pointer' }}>
                    <X size={24} />
                  </button>
                  <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    New Entry {draftBadge}
                  </span>
                  <div style={{ width: 24 }} />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <AvatarRing user={user || {}} size={42} />
                  <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
                    {user?.name}
                  </span>
                </div>

                <textarea
                  value={text}
                  onChange={e => setText(e.target.value)}
                  placeholder="Share an idea, insight or thought..."
                  style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', resize: 'none', fontFamily: 'var(--font-body)', fontSize: '1rem', lineHeight: 1.6, color: 'var(--text-primary)', minHeight: 220, padding: '4px 0', width: '100%' }}
                />

                <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-card)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: '0.8125rem', fontFamily: 'var(--font-body)', color: isOver ? 'var(--color-error)' : 'var(--text-muted)', fontWeight: 600 }}>
                      {text.length} / {MAX_CHARS}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 12, flex: 1, justifyContent: 'flex-end', marginLeft: 16 }}>
                    <button className="btn btn-ghost" onClick={onClose} style={{ flex: 1, maxWidth: 120, height: 50, borderRadius: 'var(--r-full)', fontSize: '0.9375rem', background: 'transparent' }}>
                      Cancel
                    </button>
                    <button
                      onClick={handlePublish}
                      disabled={!text.trim() || isOver || publishing}
                      className={`btn btn-primary ${text.trim() && !isOver && !publishing ? 'glow-btn' : ''}`}
                      style={{ flex: '0 0 45%', height: 50, borderRadius: 'var(--r-full)', fontSize: '0.9375rem', opacity: !text.trim() || isOver ? 0.45 : 1, cursor: !text.trim() || isOver ? 'not-allowed' : 'pointer', background: success ? 'var(--color-success)' : 'var(--color-primary)' }}
                    >
                      {success ? <Check size={18} /> : publishing ? <span className="spin" style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%' }} /> : 'Publish'}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <PenLine size={18} color="var(--color-primary)" strokeWidth={1.8} />
                    <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      New Entry
                    </span>
                    {draftBadge}
                  </div>
                  <button onClick={onClose} style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)', borderRadius: 10, width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)', transition: 'background 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--p-cream)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-subtle)'}
                  >
                    <X size={16} />
                  </button>
                </div>

                <div style={{ height: 1, background: 'var(--border)', marginBottom: 24 }} />

                <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
                  <AvatarRing user={user || {}} size={44} />
                  <textarea
                    value={text}
                    onChange={e => setText(e.target.value)}
                    placeholder="What's on your mind today? Write an idea, insight, or story…"
                    style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', resize: 'none', fontFamily: 'var(--font-body)', fontSize: '1.0625rem', lineHeight: 1.7, color: 'var(--text-primary)', minHeight: 140, maxHeight: 300, overflow: 'auto', paddingTop: 4 }}
                  />
                </div>

                <div style={{ height: 1, background: 'var(--border)', marginBottom: 20 }} />

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <svg width={32} height={32} style={{ transform: 'rotate(-90deg)' }}>
                      <circle cx={16} cy={16} r={13} fill="none" stroke="var(--border)" strokeWidth={2.5} />
                      <circle cx={16} cy={16} r={13} fill="none"
                        stroke={ringColor} strokeWidth={2.5} strokeLinecap="round"
                        strokeDasharray={circ * (13 / 11)} strokeDashoffset={(circ * (13 / 11)) * (1 - progress)}
                        style={{ transition: 'stroke-dashoffset 0.18s, stroke 0.18s' }}
                      />
                    </svg>
                    <span style={{ fontSize: '0.875rem', fontFamily: 'var(--font-body)', color: isOver ? 'var(--color-error)' : 'var(--text-muted)', fontWeight: 500 }}>
                      {remaining} remaining
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: 12 }}>
                    <button className="btn btn-ghost" onClick={onClose} style={{ fontSize: '0.9rem', padding: '10px 20px' }}>
                      Cancel
                    </button>

                    <AnimatePresence mode="wait">
                      {success ? (
                        <motion.button key="ok" initial={{ scale: 0.85 }} animate={{ scale: 1 }}
                          className="btn btn-primary" style={{ background: 'var(--color-success)', minWidth: 120 }}>
                          <Check size={16} /> Published
                        </motion.button>
                      ) : (
                        <motion.button key="pub"
                          onClick={handlePublish}
                          disabled={!text.trim() || isOver || publishing}
                          className={`btn btn-primary ${text.trim() && !isOver && !publishing ? 'glow-btn' : ''}`}
                          style={{ minWidth: 120, fontSize: '0.9rem', padding: '10px 24px', opacity: !text.trim() || isOver ? 0.45 : 1, cursor: !text.trim() || isOver ? 'not-allowed' : 'pointer' }}
                        >
                          {publishing ? (
                            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span className="spin" style={{ width: 14, height: 14, display: 'inline-block', border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%' }} />
                              Publishing…
                            </span>
                          ) : (
                            <><PenLine size={15} strokeWidth={1.8} /> Publish</>
                          )}
                        </motion.button>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
