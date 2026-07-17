// Leaderboard.jsx – wired to backend, sorted by XP
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { formatNumber } from '../utils/formatTime';
import AvatarRing      from '../components/AvatarRing';
import AnimatedCounter from '../components/AnimatedCounter';
import SkeletonCard    from '../components/SkeletonCard';
import { useToast }    from '../components/Toast';
import api             from '../services/api';
import { Heart, Zap } from 'lucide-react';

/* ── Brown palette medals ── */
const MEDAL = {
  1: { color: '#AA8472', border: 'rgba(170,132,114,0.28)', bg: 'rgba(170,132,114,0.07)', label: 'First Place',  numeral: 'I'   },
  2: { color: '#C49B87', border: 'rgba(196,155,135,0.25)', bg: 'rgba(196,155,135,0.07)', label: 'Second Place', numeral: 'II'  },
  3: { color: '#CEB1A3', border: 'rgba(206,177,163,0.22)', bg: 'rgba(206,177,163,0.07)', label: 'Third Place',  numeral: 'III' },
};

function TopCard({ entry, index }) {
  const medal = MEDAL[entry.rank];
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.42, delay: index * 0.10, ease: [0.16, 1, 0.3, 1] }}
      style={{
        flex: 1, background: 'var(--bg-card)',
        border: `1.5px solid ${medal.border}`,
        borderRadius: 22,
        padding: entry.rank === 1 ? '30px 20px 24px' : '20px 16px 18px',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        gap: entry.rank === 1 ? 14 : 10,
        boxShadow: entry.rank === 1 ? '0 12px 40px rgba(170,132,114,0.4)' : `0 6px 28px ${medal.border}`,
        position: 'relative', overflow: 'hidden',
      }}
    >
      <div style={{ position: 'absolute', inset: 0, background: medal.bg, pointerEvents: 'none', borderRadius: 22 }} />
      <span style={{ fontFamily: 'var(--font-serif)', fontSize: entry.rank === 1 ? '1.25rem' : '0.875rem', fontWeight: 500, color: medal.color, letterSpacing: '0.06em', position: 'relative', zIndex: 1 }}>
        {medal.numeral}
      </span>
      <div style={{ position: 'relative', zIndex: 1 }}>
        <AvatarRing user={entry} size={entry.rank === 1 ? 84 : 54} showRing={entry.rank === 1} ringProgress={entry.xp / (entry.xpMax || 1000)} />
      </div>
      <div style={{ textAlign: 'center', zIndex: 1, position: 'relative' }}>
        <div style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: entry.rank === 1 ? '1.1rem' : '0.8125rem', color: 'var(--text-primary)' }}>
          {entry.name}
        </div>
        <div style={{ fontSize: entry.rank === 1 ? '0.8rem' : '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
          @{entry.username}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5, alignItems: 'center', zIndex: 1, position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Zap size={12} color={medal.color} />
          <AnimatedCounter value={entry.xp} style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: entry.rank === 1 ? '1.05rem' : '0.9rem', color: medal.color }} />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>XP</span>
        </div>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
          {entry.postsCount} entries
        </div>
      </div>
      <div style={{ width: '60%', height: 2, borderRadius: 2, background: medal.color, opacity: 0.4, position: 'relative', zIndex: 1 }} />
    </motion.div>
  );
}

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const addToast = useToast();

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const { data } = await api.get('/users/leaderboard');
        if (data.success) setLeaderboard(data.leaderboard);
      } catch (err) {
        addToast('Failed to load leaderboard.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  const top3 = leaderboard.filter(e => e.rank <= 3);
  const rest  = leaderboard.filter(e => e.rank > 3);

  return (
    <div className="page-container">
      <motion.header initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 28 }}>
        <p className="section-label" style={{ marginBottom: 6 }}>✦ Rankings</p>
        <h1 className="page-title">Leaderboard</h1>
        <p className="page-subtitle">Ideas ranked by community appreciation</p>
      </motion.header>

      {loading ? (
        <div className="feed">
          {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <>
          {/* Top 3 cards */}
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', marginBottom: 32 }}>
            {[top3[1], top3[0], top3[2]].filter(Boolean).map((entry, i) => (
              <TopCard key={entry.rank} entry={entry} index={i} />
            ))}
          </div>

          {/* Remaining list */}
          <div>
            <p className="section-label" style={{ marginBottom: 14 }}>Continuing rankings</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {rest.map((entry, i) => (
                <motion.div
                  key={entry._id}
                  initial={{ opacity: 0, x: -18 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.42 + i * 0.07, ease: [0.16, 1, 0.3, 1] }}
                  className="card"
                  style={{ padding: '15px 18px' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
                    <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', fontWeight: 500, color: 'var(--text-muted)', width: 28, textAlign: 'center', flexShrink: 0 }}>
                      {entry.rank}
                    </span>
                    <AvatarRing user={entry} size={38} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
                        {entry.name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
                        @{entry.username}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end', marginBottom: 3 }}>
                        <Zap size={12} color="var(--color-primary)" />
                        <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)', fontFamily: 'var(--font-sans)' }}>
                          {formatNumber(entry.xp)} XP
                        </span>
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--color-primary)', fontWeight: 600, fontFamily: 'var(--font-body)' }}>
                        {entry.postsCount} entries
                      </div>
                    </div>
                  </div>
                  {entry.topPost && (
                    <div style={{ marginTop: 11, padding: '10px 14px', background: 'var(--bg-subtle)', borderRadius: 12, borderLeft: '2px solid var(--p-brown-4)', fontFamily: 'var(--font-body)', fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.55, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {entry.topPost.content}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
