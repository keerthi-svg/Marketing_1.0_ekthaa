// Notifications.jsx – wired to backend API
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AvatarRing from '../components/AvatarRing';
import EmptyState from '../components/EmptyState';
import { useToast } from '../components/Toast';
import api from '../services/api';
import { Heart, MessageCircle, UserPlus, Zap, Award } from 'lucide-react';

const TYPE = {
  like:    { icon: Heart,         color: 'var(--color-error)',    label: 'liked your entry'  },
  comment: { icon: MessageCircle, color: 'var(--color-primary)',  label: 'commented'         },
  follow:  { icon: UserPlus,      color: 'var(--color-success)',  label: 'followed you'      },
  xp:      { icon: Zap,           color: 'var(--color-warning)',  label: 'XP earned'         },
  badge:   { icon: Award,         color: 'var(--color-secondary)',label: 'badge unlocked'    },
};

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const min  = Math.floor(diff / 60000);
  if (min < 1)   return 'just now';
  if (min < 60)  return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24)   return `${hr}h ago`;
  return `${Math.floor(hr / 24)}d ago`;
}

export default function Notifications() {
  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const addToast = useToast();

  const unread = items.filter(n => !n.read).length;

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const { data } = await api.get('/notifications');
        if (data.success) setItems(data.notifications);
      } catch (err) {
        addToast('Failed to load notifications.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  const markAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setItems(prev => prev.map(n => ({ ...n, read: true })));
    } catch {
      addToast('Failed to mark as read.', 'error');
    }
  };

  const markRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setItems(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
    } catch {}
  };

  return (
    <div className="page-container">

      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}
      >
        <div>
          <p className="section-label" style={{ marginBottom: 6 }}>✦ Updates</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 className="page-title">Notifications</h1>
            {unread > 0 && (
              <span style={{ background: 'var(--color-primary)', color: '#fff', borderRadius: 'var(--r-full)', padding: '2px 10px', fontSize: '0.7rem', fontWeight: 700, fontFamily: 'var(--font-body)' }}>
                {unread}
              </span>
            )}
          </div>
          <p className="page-subtitle">Stay in touch with your community</p>
        </div>
        {unread > 0 && (
          <button onClick={markAllRead} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)', paddingTop: 4 }}>
            Mark read
          </button>
        )}
      </motion.div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[1, 2, 3].map(i => (
            <div key={i} className="card" style={{ padding: '15px 18px', display: 'flex', gap: 13, alignItems: 'center' }}>
              <div className="skeleton" style={{ width: 40, height: 40, borderRadius: '50%', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div className="skeleton" style={{ width: '60%', height: 12, borderRadius: 6, marginBottom: 7 }} />
                <div className="skeleton" style={{ width: '30%', height: 10, borderRadius: 6 }} />
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState type="notifications" />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {items.map((notif, i) => {
            const cfg  = TYPE[notif.type] || TYPE.xp;
            const Icon = cfg.icon;
            const actor = notif.sender;

            return (
              <motion.div
                key={notif._id}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                onClick={() => !notif.read && markRead(notif._id)}
                style={{
                  background: notif.read ? 'var(--bg-card)' : 'rgba(235,222,215,0.65)',
                  borderRadius: '0 var(--r-xl) var(--r-xl) 0',
                  border: '1px solid',
                  borderColor: notif.read ? 'var(--border)' : 'rgba(170,132,114,0.3)',
                  borderLeft: notif.read ? '3px solid var(--border)' : `3px solid ${cfg.color}`,
                  padding: '15px 18px',
                  display: 'flex', alignItems: 'center', gap: 13,
                  boxShadow: notif.read ? 'none' : '0 6px 20px rgba(170,132,114,0.2)',
                  transition: 'all 0.2s ease',
                  cursor: notif.read ? 'default' : 'pointer',
                  overflow: 'hidden',
                }}
              >
                {actor ? (
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <AvatarRing user={actor} size={40} />
                    <div style={{ position: 'absolute', bottom: -2, right: -2, width: 18, height: 18, borderRadius: '50%', background: 'var(--bg-card)', border: '1.5px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon size={9} color={cfg.color} />
                    </div>
                  </div>
                ) : (
                  <div style={{ width: 40, height: 40, borderRadius: 12, flexShrink: 0, background: 'var(--bg-subtle)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={17} color={cfg.color} strokeWidth={1.8} />
                  </div>
                )}

                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-primary)', fontWeight: notif.read ? 400 : 600, lineHeight: 1.55, fontFamily: 'var(--font-body)' }}>
                    {actor && <strong style={{ fontWeight: notif.read ? 600 : 800, color: 'var(--text-primary)' }}>{actor.name} </strong>}
                    {notif.message}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 3, fontFamily: 'var(--font-body)' }}>
                    {timeAgo(notif.created_at)}
                  </div>
                </div>

                {!notif.read && (
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: cfg.color, flexShrink: 0 }} />
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
