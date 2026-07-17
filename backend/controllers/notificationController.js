// controllers/notificationController.js
const { getSupabase } = require('../config/db');

// GET /api/notifications
exports.getNotifications = async (req, res) => {
  try {
    const supabase = getSupabase();
    const userId = req.user.id || req.user._id;

    const { data: notifications, error } = await supabase
      .from('notifications')
      .select('*, sender:users!notifications_sender_id_fkey(id, name, username, avatar)')
      .eq('recipient_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    res.json({ success: true, notifications });
  } catch (err) {
    console.error('getNotifications error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch notifications.' });
  }
};

// PATCH /api/notifications/read-all
exports.markAllRead = async (req, res) => {
  try {
    const supabase = getSupabase();
    const userId = req.user.id || req.user._id;

    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('recipient_id', userId)
      .eq('read', false);

    if (error) throw error;

    res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (err) {
    console.error('markAllRead error:', err);
    res.status(500).json({ success: false, message: 'Failed to update notifications.' });
  }
};

// PATCH /api/notifications/:id/read
exports.markRead = async (req, res) => {
  try {
    const supabase = getSupabase();
    const userId = req.user.id || req.user._id;

    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', req.params.id)
      .eq('recipient_id', userId);

    if (error) throw error;

    res.json({ success: true });
  } catch (err) {
    console.error('markRead error:', err);
    res.status(500).json({ success: false, message: 'Failed to mark notification as read.' });
  }
};

// controllers/userController.js – leaderboard (was placed here originally)
exports.getLeaderboard = async (req, res) => {
  try {
    const supabase = getSupabase();

    // 1. Fetch top 20 users
    const { data: users, error: usersErr } = await supabase
      .from('users')
      .select('id, name, username, avatar, level, xp, xpmax, badges')
      .eq('isverified', true)
      .order('xp', { ascending: false })
      .limit(20);

    if (usersErr) throw usersErr;

    if (!users || users.length === 0) {
      return res.json({ success: true, leaderboard: [] });
    }

    // 2. Fetch all posts for these users in one query to avoid N+1
    const userIds = users.map(u => u.id);
    const { data: allPosts, error: postsErr } = await supabase
      .from('posts')
      .select('id, author_id, content, hashtags, created_at, likes:post_likes(user_id), comments(id)')
      .in('author_id', userIds);

    if (postsErr) throw postsErr;

    // 3. Group posts in memory
    const postsByUser = {};
    if (allPosts) {
      allPosts.forEach(post => {
        if (!postsByUser[post.author_id]) {
          postsByUser[post.author_id] = [];
        }
        postsByUser[post.author_id].push(post);
      });
    }

    // 4. Attach stats to each user
    const enriched = users.map((u, i) => {
      const userPosts = postsByUser[u.id] || [];
      const postsCount = userPosts.length;
      
      let bestPost = null;
      if (postsCount > 0) {
        bestPost = userPosts.reduce((prev, curr) => {
          const prevLikes = prev.likes ? prev.likes.length : 0;
          const currLikes = curr.likes ? curr.likes.length : 0;
          return (currLikes > prevLikes) ? curr : prev;
        });
      }

      return {
        rank: i + 1,
        ...u,
        postsCount,
        topPost: bestPost
          ? {
              ...bestPost,
              likesCount: bestPost.likes ? bestPost.likes.length : 0,
              commentsCount: bestPost.comments ? bestPost.comments.length : 0,
            }
          : null,
      };
    });

    res.json({ success: true, leaderboard: enriched });
  } catch (err) {
    console.error('Leaderboard error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch leaderboard.' });
  }
};
