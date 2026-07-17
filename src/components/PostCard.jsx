// PostCard.jsx – journal-style post card
import { useState } from 'react';
import { motion } from 'framer-motion';
import AvatarRing from './AvatarRing';
import { formatTime, formatNumber } from '../utils/formatTime';
import { getUserById } from '../data/mockData';
import { Heart, MessageCircle, Share2, MoreHorizontal, Send } from 'lucide-react';
import api from '../services/api';
import { useToast } from './Toast';

export default function PostCard({ post, index = 0 }) {
  const [liked,     setLiked]     = useState(post.liked);
  const [likeCount, setLikeCount] = useState(post.likesCount || 0);
  const [commentsCount, setCommentsCount] = useState(post.commentsCount || 0);
  
  // Comments state
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [newCommentText, setNewCommentText] = useState('');

  const user = post.author || {}; // use the author from API
  const addToast = useToast();

  const handleLike = async () => {
    // Optimistic UI
    const wasLiked = liked;
    setLiked(!wasLiked);
    setLikeCount(c => wasLiked ? c - 1 : c + 1);

    try {
      const { data } = await api.post(`/posts/${post.id}/like`);
      if (data.success) {
        setLiked(data.liked);
        setLikeCount(data.likesCount);
      }
    } catch (err) {
      console.error('Like failed', err);
      // Revert on error
      setLiked(wasLiked);
      setLikeCount(c => wasLiked ? c + 1 : c - 1);
    }
  };

  const toggleComments = async () => {
    setShowComments(!showComments);
    if (!showComments && comments.length === 0) {
      setLoadingComments(true);
      try {
        const { data } = await api.get(`/posts/${post.id}/comments`);
        if (data.success) {
          setComments(data.comments);
        }
      } catch (err) {
        console.error('Failed to load comments', err);
      } finally {
        setLoadingComments(false);
      }
    }
  };

  const submitComment = async (e) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;
    
    try {
      const { data } = await api.post(`/posts/${post.id}/comment`, { content: newCommentText.trim() });
      if (data.success) {
        setCommentsCount(data.commentsCount);
        setComments([...comments, data.comment]);
        setNewCommentText('');
        addToast('Comment added!', 'success');
      }
    } catch (err) {
      console.error('Comment failed', err);
      addToast('Failed to add comment', 'error');
    }
  };

  const handleShare = () => {
    const url = `${window.location.origin}/post/${post.id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        addToast('Link copied to clipboard!', 'info');
      });
    }
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.38, delay: index * 0.07, ease: [0.16, 1, 0.3, 1] }}
      className="card"
      style={{ padding: '24px 24px 18px' }}
    >
      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 16 }}>
        <AvatarRing user={user} size={44} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{
              fontFamily: 'var(--font-sans)',
              fontWeight: 700,
              fontSize: '0.9375rem',
              color: 'var(--text-primary)',
              letterSpacing: '-0.01em',
            }}>
              {user?.name}
            </span>
            <span style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.8rem',
              color: 'var(--text-muted)',
            }}>
              {user?.username}
            </span>
          </div>
          <span style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            letterSpacing: '0.01em',
          }}>
            {formatTime(post.created_at)}
          </span>
        </div>
        <button style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--text-muted)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: 30, height: 30, borderRadius: 8,
          transition: 'background 0.2s',
        }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-subtle)'}
          onMouseLeave={e => e.currentTarget.style.background = 'none'}
        >
          <MoreHorizontal size={16} />
        </button>
      </div>

      {/* ── Thin decorative rule above content ── */}
      <div style={{
        width: 32, height: 1.5,
        background: 'var(--color-primary)',
        borderRadius: 2,
        marginBottom: 14,
        opacity: 0.5,
      }} />

      {/* ── Body text (journal style) ── */}
      <p style={{
        fontFamily: 'var(--font-body)',
        fontSize: '0.9375rem',
        lineHeight: 1.80,
        color: 'var(--text-primary)',
        marginBottom: 16,
        letterSpacing: '-0.005em',
      }}>
        {post.content}
      </p>

      {/* ── Tags ── */}
      {post.hashtags?.length > 0 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 18 }}>
          {post.hashtags.map(tag => (
            <span key={tag} style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.72rem',
              fontWeight: 600,
              letterSpacing: '0.04em',
              color: 'var(--color-primary)',
              background: 'rgba(170,132,114,0.09)',
              border: '1px solid rgba(170,132,114,0.18)',
              padding: '3px 11px',
              borderRadius: 'var(--r-full)',
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}>
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* ── Divider ── */}
      <div style={{ height: 1, background: 'var(--border)', marginBottom: 14 }} />

      {/* ── Engagement bar ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {/* Like */}
        <motion.button
          id={`like-btn-${post.id}`}
          onClick={handleLike}
          whileTap={{ scale: 1.28 }}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: liked ? 'rgba(166,93,87,0.08)' : 'none',
            border: 'none', cursor: 'pointer',
            color: liked ? 'var(--color-error)' : 'var(--text-muted)',
            padding: '6px 13px', borderRadius: 'var(--r-full)',
            fontSize: '0.8rem', fontWeight: 500,
            fontFamily: 'var(--font-body)',
            transition: 'all 0.2s ease',
          }}
        >
          <Heart size={15} fill={liked ? 'var(--color-error)' : 'none'} />
          {formatNumber(likeCount)}
        </motion.button>

        <button
          onClick={toggleComments}
          style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--text-muted)',
          padding: '6px 13px', borderRadius: 'var(--r-full)',
          fontSize: '0.8rem', fontWeight: 500,
          fontFamily: 'var(--font-body)',
          transition: 'color 0.2s',
        }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--color-primary)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          <MessageCircle size={15} />
          {formatNumber(commentsCount)}
        </button>

        {/* Share */}
        <button
          onClick={handleShare}
          style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--text-muted)',
          padding: '6px 13px', borderRadius: 'var(--r-full)',
          fontSize: '0.8rem', fontWeight: 500,
          fontFamily: 'var(--font-body)',
          transition: 'color 0.2s',
        }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--color-secondary)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          <Share2 size={15} />
          {formatNumber(post.sharesCount || 0)}
        </button>
      </div>

      {/* ── Comments Section ── */}
      {showComments && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          style={{ marginTop: 16, overflow: 'hidden' }}
        >
          <div style={{ height: 1, background: 'var(--border)', marginBottom: 16 }} />
          
          {loadingComments ? (
            <div style={{ padding: '10px 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Loading comments...</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
              {comments.map(c => (
                <div key={c.id} style={{ display: 'flex', gap: 10 }}>
                  <AvatarRing user={c.author || {}} size={32} />
                  <div style={{
                    background: 'var(--bg-subtle)',
                    padding: '10px 14px',
                    borderRadius: 14,
                    flex: 1
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                        {c.author?.name || 'Anonymous'}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        {formatTime(c.created_at)}
                      </span>
                    </div>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--text-primary)', margin: 0, lineHeight: 1.5 }}>
                      {c.content}
                    </p>
                  </div>
                </div>
              ))}
              {comments.length === 0 && (
                <div style={{ padding: '10px 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>No comments yet. Be the first!</div>
              )}
            </div>
          )}

          {/* New comment form */}
          <form onSubmit={submitComment} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <input
              type="text"
              placeholder="Add a comment..."
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              style={{
                flex: 1,
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border)',
                padding: '10px 16px',
                borderRadius: 'var(--r-full)',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-body)',
                fontSize: '0.9rem'
              }}
            />
            <button
              type="submit"
              disabled={!newCommentText.trim()}
              className="btn btn-primary"
              style={{
                padding: '10px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: newCommentText.trim() ? 1 : 0.5,
                cursor: newCommentText.trim() ? 'pointer' : 'default'
              }}
            >
              <Send size={16} />
            </button>
          </form>
        </motion.div>
      )}
    </motion.article>
  );
}
