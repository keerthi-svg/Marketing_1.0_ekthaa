// Home.jsx – editorial home feed wired to backend
import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import PostCard    from '../components/PostCard';
import EmptyState  from '../components/EmptyState';
import AvatarRing  from '../components/AvatarRing';
import SkeletonCard from '../components/SkeletonCard';
import { useAuth }  from '../context/AuthContext';
import { useToast } from '../components/Toast';
import api          from '../services/api';
import { PenLine, RefreshCw } from 'lucide-react';

const FILTERS = ['For You', 'Following', 'Trending', 'Recent'];
const DRAFT_KEY = 'ekthaa_draft';

export default function Home({ onCreatePost }) {
  const [posts,        setPosts]        = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [activeFilter, setActiveFilter] = useState('For You');
  const [refreshing,   setRefreshing]   = useState(false);

  const { user }  = useAuth();
  const addToast  = useToast();

  // ── Fetch posts from backend ──
  const fetchPosts = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const { data } = await api.get('/posts');
      if (data.success) setPosts(data.posts);
    } catch (err) {
      addToast('Failed to load feed. ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  // ── Optimistic post insertion (called by CreatePostModal) ──
  // We expose a global event so the modal can trigger this
  useEffect(() => {
    const onNewPost = (e) => {
      const newPost = e.detail;
      if (newPost) setPosts(prev => [newPost, ...prev]);
    };
    window.addEventListener('ekthaa:new-post', onNewPost);
    return () => window.removeEventListener('ekthaa:new-post', onNewPost);
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchPosts(true);
    setRefreshing(false);
  };

  return (
    <div className="page-container">

      {/* ── Editorial Header ── */}
      <motion.header
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.32 }}
        style={{ marginBottom: 28 }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <p className="section-label" style={{ marginBottom: 6 }}>✦ Your feed</p>
            <h1 className="page-title">Home</h1>
            <p className="page-subtitle">Ideas worth reading, curated for you</p>
          </div>
          <button onClick={handleRefresh} style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 12, padding: '8px 11px',
            cursor: 'pointer', color: 'var(--text-muted)',
            display: 'flex', alignItems: 'center',
            boxShadow: 'var(--shadow-xs)',
            transition: 'all 0.2s ease',
            marginTop: 4,
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-primary)'; e.currentTarget.style.color = 'var(--color-primary)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
          >
            <RefreshCw size={15} className={refreshing ? 'spin' : ''} />
          </button>
        </div>
      </motion.header>

      {/* ── Quick Compose Card ── */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.09 }}
        className="card"
        style={{ padding: '18px 20px', marginBottom: 22, cursor: 'pointer' }}
        onClick={onCreatePost}
        whileHover={{ y: -2 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
          <AvatarRing user={user || {}} size={40} />
          <div style={{
            flex: 1,
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--r-full)',
            padding: '10px 18px',
            fontFamily: 'var(--font-body)',
            fontStyle: 'italic',
            color: 'var(--text-muted)',
            fontSize: '0.9rem',
            cursor: 'text',
          }}>
            What are you thinking about today?
          </div>
          <button onClick={e => { e.stopPropagation(); onCreatePost(); }}
            className="btn btn-primary"
            style={{ padding: '9px 18px', fontSize: '0.85rem', flexShrink: 0 }}
          >
            <PenLine size={14} strokeWidth={1.8} /> Write
          </button>
        </div>
      </motion.div>

      {/* ── Filter Tabs ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.14 }}
        style={{
          display: 'flex', gap: 6, marginBottom: 22,
          overflowX: 'auto', paddingBottom: 3, scrollbarWidth: 'none',
        }}
      >
        {FILTERS.map(f => (
          <button key={f} onClick={() => setActiveFilter(f)} style={{
            flexShrink: 0,
            padding: '7px 18px', borderRadius: 'var(--r-full)',
            border: '1px solid',
            borderColor: activeFilter === f ? 'rgba(170,132,114,0.40)' : 'var(--border)',
            background: activeFilter === f ? 'rgba(170,132,114,0.10)' : 'transparent',
            color: activeFilter === f ? 'var(--color-primary)' : 'var(--text-muted)',
            fontSize: '0.8125rem',
            fontWeight: activeFilter === f ? 700 : 500,
            fontFamily: 'var(--font-body)',
            letterSpacing: '0.01em',
            cursor: 'pointer',
            transition: 'all 0.22s ease',
          }}>
            {f}
          </button>
        ))}
      </motion.div>

      {/* ── Feed ── */}
      {loading ? (
        <div className="feed">
          {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
        </div>
      ) : posts.length === 0 ? (
        <EmptyState type="posts" action={onCreatePost} actionLabel="Write your first idea" />
      ) : (
        <div className="feed">
          {posts.map((post, i) => <PostCard key={post._id || post.id} post={post} index={i} />)}
        </div>
      )}
    </div>
  );
}
