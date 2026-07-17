// Search.jsx – refined editorial search
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { mockPosts, mockUsers, trendingTopics } from '../data/mockData';
import PostCard   from '../components/PostCard';
import AvatarRing from '../components/AvatarRing';
import EmptyState from '../components/EmptyState';
import { Search as SearchIcon, X } from 'lucide-react';
import { formatNumber } from '../utils/formatTime';

export default function Search() {
  const [query,     setQuery]     = useState('');
  const [activeTab, setActiveTab] = useState('Posts');

  const q = query.toLowerCase().trim();

  const filteredPosts  = q ? mockPosts.filter(p =>
    p.content.toLowerCase().includes(q) || p.tags?.some(t => t.toLowerCase().includes(q))
  ) : [];

  const filteredPeople = q ? mockUsers.filter(u =>
    u.name.toLowerCase().includes(q) || u.username.toLowerCase().includes(q) || u.bio.toLowerCase().includes(q)
  ) : [];

  return (
    <div className="page-container">

      <motion.header initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 26 }}>
        <p className="section-label" style={{ marginBottom: 6 }}>✦ Discover</p>
        <h1 className="page-title">Search</h1>
        <p className="page-subtitle">Find ideas, voices, and conversations</p>
      </motion.header>

      {/* ── Search Input ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.10 }}
        style={{ position: 'relative', marginBottom: 26 }}
      >
        <SearchIcon size={17} style={{
          position: 'absolute', left: 18, top: '50%',
          transform: 'translateY(-50%)',
          color: 'var(--text-muted)', pointerEvents: 'none',
        }} />
        <input
          id="search-input"
          className="input"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search posts, ideas, or people…"
          style={{ paddingLeft: 48, paddingRight: 42, borderRadius: 'var(--r-full)', fontSize: '0.9375rem' }}
        />
        {query && (
          <button onClick={() => setQuery('')} style={{
            position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
            background: 'var(--bg-subtle)', border: 'none',
            borderRadius: '50%', width: 24, height: 24,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: 'var(--text-muted)',
          }}>
            <X size={13} />
          </button>
        )}
      </motion.div>

      {q ? (
        <>
          {/* Tabs */}
          <div style={{ display: 'flex', gap: 2, borderBottom: '1px solid var(--border)', marginBottom: 22 }}>
            {['Posts', 'People'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                padding: '9px 20px',
                fontFamily: 'var(--font-sans)',
                fontSize: '0.875rem',
                fontWeight: activeTab === tab ? 700 : 500,
                color: activeTab === tab ? 'var(--color-primary)' : 'var(--text-muted)',
                borderBottom: `2px solid ${activeTab === tab ? 'var(--color-primary)' : 'transparent'}`,
                marginBottom: -1,
                transition: 'all 0.2s',
              }}>
                {tab} ({tab === 'Posts' ? filteredPosts.length : filteredPeople.length})
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'Posts' && (
              <motion.div key="posts" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {filteredPosts.length > 0
                  ? <div className="feed">{filteredPosts.map((p, i) => <PostCard key={p.id} post={p} index={i} />)}</div>
                  : <EmptyState type="search" />
                }
              </motion.div>
            )}
            {activeTab === 'People' && (
              <motion.div key="people" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {filteredPeople.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {filteredPeople.map((u, i) => (
                      <motion.div
                        key={u.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.06 }}
                        className="card"
                        style={{ padding: '18px 20px' }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
                          <AvatarRing user={u} size={46} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>{u.name}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-body)', marginBottom: 4 }}>{u.username}</div>
                            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-body)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.bio}</div>
                          </div>
                          <div style={{ textAlign: 'right', flexShrink: 0 }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-primary)', fontFamily: 'var(--font-body)', marginBottom: 3 }}>Lv.{u.level}</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{formatNumber(u.followers)} followers</div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : <EmptyState type="search" />}
              </motion.div>
            )}
          </AnimatePresence>
        </>
      ) : (
        /* Trending list when no query */
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}>
          <p className="section-label" style={{ marginBottom: 14 }}>Trending topics</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            {trendingTopics.map((t, i) => (
              <motion.div
                key={t.tag}
                initial={{ opacity: 0, x: -14 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.18 + i * 0.06 }}
                className="card"
                style={{ padding: '15px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                onClick={() => setQuery(t.tag)}
              >
                <div>
                  <div style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, color: 'var(--color-primary)', fontSize: '0.9375rem' }}>{t.tag}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-body)', marginTop: 2 }}>{formatNumber(t.posts)} posts</div>
                </div>
                <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1rem', color: 'var(--p-brown-4)' }}>#{i + 1}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
