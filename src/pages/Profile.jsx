// Profile.jsx – wired to backend with logout button at bottom
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AvatarRing      from '../components/AvatarRing';
import AnimatedCounter from '../components/AnimatedCounter';
import PostCard        from '../components/PostCard';
import SkeletonCard    from '../components/SkeletonCard';
import { useAuth }     from '../context/AuthContext';
import { useToast }    from '../components/Toast';
import api             from '../services/api';
import { Linkedin, Instagram, Edit3, Zap, Award, LogOut } from 'lucide-react';

const TABS = ['Entries', 'About', 'Achievements'];

export default function Profile() {
  const [activeTab, setActiveTab] = useState('Entries');
  const [userPosts, setUserPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [loggingOut,   setLoggingOut]   = useState(false);

  const { user, logout } = useAuth();
  const addToast         = useToast();

  const xpProgress = user ? user.xp / (user.xpMax || 1000) : 0;

  // ── Fetch this user's posts ──
  useEffect(() => {
    const fetchPosts = async () => {
      setPostsLoading(true);
      try {
        const { data } = await api.get('/posts?author=me');
        if (data.success) setUserPosts(data.posts);
      } catch (err) {
        addToast('Failed to load posts.', 'error');
      } finally {
        setPostsLoading(false);
      }
    };
    fetchPosts();
  }, []);

  // ── Logout handler ──
  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      addToast('See you soon! ✦', 'info');
      // Navigate happens automatically via ProtectedRoute
    } catch {
      setLoggingOut(false);
    }
  };

  if (!user) return null;

  return (
    <div style={{ paddingBottom: 40 }}>

      {/* ── Gradient banner ── */}
      <div style={{
        height: 190,
        background: 'linear-gradient(135deg, #AA8472 0%, #C49B87 45%, #DDC3B7 80%, #E8D3CA 100%)',
        position: 'relative', overflow: 'hidden',
      }}>
        {[
          { r: 160, x: -40, y: -60, o: 0.08 },
          { r: 100, x: '65%', y: -30, o: 0.06 },
          { r: 70, x: '80%',  y: 80,  o: 0.07 },
          { r: 200, x: '90%', y: -80, o: 0.05 },
        ].map((c, i) => (
          <div key={i} style={{
            position: 'absolute',
            width: c.r * 2, height: c.r * 2, borderRadius: '50%',
            left: c.x, top: c.y,
            border: '1.5px solid rgba(255,255,255,0.35)',
            opacity: c.o, pointerEvents: 'none',
          }} />
        ))}
        <div style={{ position: 'absolute', top: 18, left: 18, fontFamily: 'var(--font-serif)', fontSize: 20, color: 'rgba(255,255,255,0.30)' }}>✦</div>
        <div style={{ position: 'absolute', top: 32, right: 28, fontFamily: 'var(--font-serif)', fontSize: 14, color: 'rgba(255,255,255,0.25)' }}>✧</div>
        <button style={{
          position: 'absolute', top: 16, right: 16,
          background: 'rgba(255,255,255,0.20)', border: '1px solid rgba(255,255,255,0.30)',
          borderRadius: 11, padding: '7px 15px',
          color: '#fff', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-sans)',
          backdropFilter: 'blur(8px)',
        }}>
          <Edit3 size={13} /> Edit Profile
        </button>
      </div>

      <div className="page-container" style={{ paddingTop: 0 }}>

        {/* ── Avatar overlapping banner ── */}
        <div style={{ position: 'relative', marginTop: -54, marginBottom: 18 }}>
          <div style={{ display: 'inline-block' }}>
            <AvatarRing user={user} size={108} showRing ringProgress={xpProgress} />
          </div>
        </div>

        {/* ── Identity ── */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 4 }}>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              {user.name}
            </h1>
            <span style={{ background: 'rgba(170,132,114,0.12)', border: '1px solid rgba(170,132,114,0.22)', color: 'var(--color-primary)', fontSize: '0.72rem', fontWeight: 700, padding: '3px 12px', borderRadius: 'var(--r-full)', fontFamily: 'var(--font-body)', letterSpacing: '0.04em' }}>
              LEVEL {user.level}
            </span>
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: 10, fontFamily: 'var(--font-body)' }}>
            @{user.username}
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', lineHeight: 1.7, maxWidth: 500, fontFamily: 'var(--font-body)' }}>
            {user.bio || 'No bio yet.'}
          </p>
        </motion.div>

        {/* ── XP Bar ── */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="card" style={{ padding: '15px 20px', marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 9 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <Zap size={13} color="var(--color-primary)" strokeWidth={1.8} />
              <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)', fontFamily: 'var(--font-sans)' }}>Experience</span>
            </div>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-primary)', fontFamily: 'var(--font-body)' }}>
              {user.xp?.toLocaleString()} / {user.xpMax?.toLocaleString()}
            </span>
          </div>
          <div style={{ height: 7, background: 'var(--bg-subtle)', borderRadius: 'var(--r-full)', overflow: 'hidden', border: '1px solid var(--border)' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${xpProgress * 100}%` }}
              transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
              style={{ height: '100%', background: 'linear-gradient(90deg, #AA8472, #C49B87, #E8D3CA)', borderRadius: 'var(--r-full)' }}
            />
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 7, fontFamily: 'var(--font-body)' }}>
            {Math.round(xpProgress * 100)}% · Level {(user.level || 1) + 1} in progress
          </div>
        </motion.div>

        {/* ── Stats ── */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 18 }}>
          {[
            { label: 'Entries',   value: userPosts.length,               sym: '✦' },
            { label: 'Followers', value: user.followers?.length || 0,    sym: '✧' },
            { label: 'Following', value: user.following?.length || 0,    sym: '○' },
          ].map(s => (
            <div key={s.label} className="card" style={{ padding: '18px 12px', textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: 22, color: 'var(--p-brown-3)', marginBottom: 6 }}>{s.sym}</div>
              <AnimatedCounter value={s.value} style={{ display: 'block', fontFamily: 'var(--font-sans)', fontWeight: 800, fontSize: '1.3rem', color: 'var(--text-primary)' }} />
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 3, fontFamily: 'var(--font-body)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                {s.label}
              </div>
            </div>
          ))}
        </motion.div>

        {/* ── Social links ── */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }} style={{ display: 'flex', gap: 10, marginBottom: 26 }}>
          {user.linkedin && (
            <a href={user.linkedin} target="_blank" rel="noreferrer" className="btn btn-ghost" style={{ flex: 1, padding: '10px 0', fontSize: '0.875rem', textDecoration: 'none' }}>
              <Linkedin size={15} strokeWidth={1.8} /> LinkedIn
            </a>
          )}
          {user.instagram && (
            <a href={user.instagram} target="_blank" rel="noreferrer" style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '10px 0', fontSize: '0.875rem', textDecoration: 'none', fontWeight: 600, fontFamily: 'var(--font-sans)', borderRadius: 20, background: 'rgba(166,93,87,0.07)', border: '1px solid rgba(166,93,87,0.20)', color: 'var(--color-error)', transition: 'all 0.25s ease' }}>
              <Instagram size={15} strokeWidth={1.8} /> Instagram
            </a>
          )}
        </motion.div>

        {/* ── Content Tabs ── */}
        <div style={{ display: 'flex', gap: 2, borderBottom: '1px solid var(--border)', marginBottom: 22 }}>
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '10px 18px', fontFamily: 'var(--font-sans)', fontSize: '0.875rem',
              fontWeight: activeTab === tab ? 700 : 500,
              color: activeTab === tab ? 'var(--color-primary)' : 'var(--text-muted)',
              borderBottom: `2px solid ${activeTab === tab ? 'var(--color-primary)' : 'transparent'}`,
              marginBottom: -1, letterSpacing: '0.01em', transition: 'all 0.2s ease',
            }}>
              {tab}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === 'Entries' && (
          <div className="feed">
            {postsLoading ? (
              [1, 2].map(i => <SkeletonCard key={i} />)
            ) : userPosts.length > 0 ? (
              userPosts.map((post, i) => <PostCard key={post._id || post.id} post={post} index={i} />)
            ) : (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 48, fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>
                No entries yet
              </div>
            )}
          </div>
        )}

        {activeTab === 'Achievements' && (
          <div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 9, marginBottom: 24 }}>
              {(user.badges || []).map(badge => (
                <span key={badge} style={{ padding: '7px 16px', borderRadius: 'var(--r-full)', background: 'rgba(170,132,114,0.09)', border: '1px solid rgba(170,132,114,0.20)', fontSize: '0.8125rem', fontWeight: 600, fontFamily: 'var(--font-body)', color: 'var(--color-primary)', letterSpacing: '0.01em' }}>
                  {badge}
                </span>
              ))}
              {(!user.badges || user.badges.length === 0) && (
                <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)', fontStyle: 'italic' }}>No badges yet. Keep writing!</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'About' && (
          <div className="card" style={{ padding: '22px 24px' }}>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.9375rem', color: 'var(--text-secondary)', lineHeight: 1.75 }}>
              {user.bio || 'No bio yet.'}
            </p>
            <div style={{ marginTop: 18, paddingTop: 16, borderTop: '1px solid var(--border)', display: 'flex', gap: 24 }}>
              <div>
                <div className="section-label" style={{ marginBottom: 4 }}>Joined</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-primary)', fontFamily: 'var(--font-body)' }}>
                  {user.created_at ? new Date(user.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long' }) : '—'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Logout Button ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{ marginTop: 36, paddingTop: 24, borderTop: '1px solid var(--border)' }}
        >
          <button
            id="profile-logout"
            onClick={handleLogout}
            disabled={loggingOut}
            style={{
              width: '100%',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9,
              padding: '13px 0',
              background: 'rgba(166,93,87,0.06)',
              border: '1px solid rgba(166,93,87,0.22)',
              borderRadius: 14,
              cursor: loggingOut ? 'not-allowed' : 'pointer',
              fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: '0.9rem',
              color: 'var(--color-error)',
              transition: 'all 0.22s ease',
              opacity: loggingOut ? 0.6 : 1,
            }}
            onMouseEnter={e => { if (!loggingOut) { e.currentTarget.style.background = 'rgba(166,93,87,0.12)'; e.currentTarget.style.borderColor = 'rgba(166,93,87,0.40)'; } }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(166,93,87,0.06)'; e.currentTarget.style.borderColor = 'rgba(166,93,87,0.22)'; }}
          >
            {loggingOut ? (
              <span className="spin" style={{ width: 16, height: 16, border: '2px solid rgba(166,93,87,0.3)', borderTop: '2px solid var(--color-error)', borderRadius: '50%', display: 'inline-block' }} />
            ) : (
              <LogOut size={16} />
            )}
            {loggingOut ? 'Signing out…' : 'Sign Out'}
          </button>
          <p style={{ textAlign: 'center', fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 10, fontStyle: 'italic' }}>
            You'll need to sign in again to access Ekthaa.
          </p>
        </motion.div>

      </div>
    </div>
  );
}
