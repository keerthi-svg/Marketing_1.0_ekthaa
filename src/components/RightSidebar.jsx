// RightSidebar.jsx – editorial right panel wired to backend
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Award } from 'lucide-react';
import { formatNumber } from '../utils/formatTime';
import AvatarRing from './AvatarRing';
import api from '../services/api';

const MEDAL_COLOR = { 1: '#AA8472', 2: '#C49B87', 3: '#CEB1A3' };
const MEDAL_EMOJI  = { 1: '✦', 2: '✧', 3: '·' };

export default function RightSidebar() {
  const navigate    = useNavigate();
  const [trending,  setTrending]  = useState([]);
  const [topUsers,  setTopUsers]  = useState([]);

  useEffect(() => {
    api.get('/posts/trending').then(({ data }) => {
      if (data.success) setTrending(data.trending);
    }).catch(() => {});

    api.get('/users/leaderboard').then(({ data }) => {
      if (data.success) setTopUsers(data.leaderboard.slice(0, 3));
    }).catch(() => {});
  }, []);


  return (
    <aside style={{
      position: 'fixed',
      right: 0, top: 0, bottom: 0,
      width: 'var(--right-sb-w)',
      borderLeft: '1px solid var(--border)',
      background: 'var(--bg-sidebar)',
      backdropFilter: 'blur(18px)',
      WebkitBackdropFilter: 'blur(18px)',
      padding: '28px 20px',
      overflowY: 'auto',
      zIndex: 40,
      display: 'flex',
      flexDirection: 'column',
      gap: 32,
    }}>

      {/* Trending */}
      <section>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 14 }}>
          <TrendingUp size={14} color="var(--color-primary)" strokeWidth={1.8} />
          <span className="section-label" style={{ color: '#6A4C3B', fontWeight: 700 }}>Trending</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          {trending.map((t, i) => (
            <div key={t.tag} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '9px 14px',
              borderRadius: 12,
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              boxShadow: 'var(--shadow-sm)',
              cursor: 'pointer',
              transition: 'all 0.22s ease',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-subtle)'; e.currentTarget.style.transform = 'translateX(3px)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-card)'; e.currentTarget.style.transform = 'translateX(0)'; }}
            >
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.8375rem', color: 'var(--color-primary)', fontFamily: 'var(--font-sans)' }}>{t.tag}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 1 }}>{formatNumber(t.posts)} posts</div>
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 700 }}>#{i + 1}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Top Ranked */}
      <section>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <Award size={14} color="var(--color-primary)" strokeWidth={1.8} />
            <span className="section-label" style={{ color: 'var(--text-secondary)', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Top Ranked</span>
          </div>
          <button onClick={() => navigate('/leaderboard')} style={{
            background: 'none', border: 'none',
            color: 'var(--color-primary)',
            fontSize: '0.75rem', fontWeight: 600,
            cursor: 'pointer', fontFamily: 'var(--font-body)',
            transition: 'color 0.2s',
          }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--color-primary)'}
          >
            See all →
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          {topUsers.map(entry => {
            const user = entry;
            return (
              <div key={entry.rank} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '10px 8px',
                height: 52,
                borderRadius: 13,
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-sm)',
                transition: 'background 0.2s',
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-subtle)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-card)'}
              >
                {/* Serif rank */}
                <span style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  width: 16, textAlign: 'center', flexShrink: 0,
                }}>
                  {MEDAL_EMOJI[entry.rank]}
                </span>
                <AvatarRing user={user} size={28} />
                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <div style={{
                    fontWeight: 600, fontSize: '0.8rem',
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-sans)',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>
                    {user?.name}
                  </div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                    {entry.xp?.toLocaleString()} XP
                  </div>
                </div>
                <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-secondary)', flexShrink: 0, display: 'none' }}>
                  +{formatNumber(entry.xpEarned)} XP
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer quote */}
      <div style={{ marginTop: 'auto', paddingTop: 20, borderTop: '1px solid var(--border)' }}>
        <p style={{
          fontFamily: 'var(--font-serif)',
          fontStyle: 'italic',
          fontSize: '0.8125rem',
          color: 'var(--text-muted)',
          lineHeight: 1.6,
        }}>
          "Ideas grow when shared."
        </p>
        <p style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', fontWeight: 500, marginTop: 8, fontFamily: 'var(--font-body)' }}>
          © {new Date().getFullYear()} Ekthaa
        </p>
      </div>
    </aside>
  );
}
