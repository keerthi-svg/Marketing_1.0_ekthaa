// controllers/postController.js – Supabase CRUD + like + trending
const { getSupabase } = require('../config/db');

// ─────────────────────────────────────────
// POST /api/posts
// ─────────────────────────────────────────
exports.createPost = async (req, res) => {
  try {
    const supabase = getSupabase();
    const { content } = req.body;
    const userId = req.user.id || req.user._id;

    // Extract hashtags from content (e.g. #Design, #Tech)
    const hashtags = (content.match(/#[a-zA-Z0-9_]+/g) || [])
      .map(t => t.slice(1).toLowerCase());

    const { data: post, error } = await supabase
      .from('posts')
      .insert([{
        author_id: userId,
        content,
        hashtags,
      }])
      .select('*, author:users!posts_author_id_fkey(id, name, username, avatar, level, xp)')
      .single();

    if (error) throw error;

    // Award XP to the author (+10 per post)
    // We fetch current XP first, or do an RPC. Let's do a fetch and update.
    const { data: user } = await supabase.from('users').select('xp').eq('id', userId).single();
    if (user) {
      await supabase.from('users').update({ xp: user.xp + 10 }).eq('id', userId);
    }

    // XP notification
    await supabase.from('notifications').insert([{
      recipient_id: userId,
      type: 'xp',
      message: 'You earned 10 XP for publishing an entry! ⚡',
    }]);

    res.status(201).json({ success: true, post });
  } catch (err) {
    console.error('CreatePost error:', err);
    res.status(500).json({ success: false, message: 'Failed to publish post.' });
  }
};

// ─────────────────────────────────────────
// GET /api/posts
// ─────────────────────────────────────────
exports.getPosts = async (req, res) => {
  try {
    const supabase = getSupabase();
    const { author, limit = 20, page = 1 } = req.query;
    const userId = req.user.id || req.user._id;
    
    // pagination (zero-indexed)
    const from = (parseInt(page) - 1) * parseInt(limit);
    const to = from + parseInt(limit) - 1;

    let query = supabase
      .from('posts')
      .select(`
        *,
        author:users!posts_author_id_fkey(id, name, username, avatar, level, xp, badges),
        likes:post_likes(user_id),
        comments(id)
      `)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (author === 'me') {
      query = query.eq('author_id', userId);
    } else if (author) {
      query = query.eq('author_id', author);
    }

    const { data: posts, error } = await query;
    if (error) throw error;

    // Attach liked-by-me flag
    const enriched = posts.map(p => ({
      ...p,
      liked: p.likes.some(like => like.user_id === userId),
      likesCount: p.likes.length,
      commentsCount: p.comments.length,
      // Map author to match expected structure
      author: p.author
    }));

    res.json({ success: true, posts: enriched });
  } catch (err) {
    console.error('GetPosts error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch posts.' });
  }
};

// ─────────────────────────────────────────
// GET /api/posts/trending
// ─────────────────────────────────────────
exports.getTrending = async (req, res) => {
  try {
    const supabase = getSupabase();
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    // Fetch recent posts with hashtags and likes
    const { data: posts, error } = await supabase
      .from('posts')
      .select('hashtags, likes:post_likes(user_id)')
      .gte('created_at', since)
      .not('hashtags', 'eq', '{}'); // Not empty array

    if (error) throw error;

    // Process trending in memory since we don't have an RPC
    const tagStats = {};
    posts.forEach(post => {
      const likesCount = post.likes ? post.likes.length : 0;
      post.hashtags.forEach(tag => {
        if (!tagStats[tag]) tagStats[tag] = { count: 0, likes: 0 };
        tagStats[tag].count += 1;
        tagStats[tag].likes += likesCount;
      });
    });

    const trending = Object.keys(tagStats)
      .map(tag => ({
        tag: `#${tag}`,
        posts: tagStats[tag].count,
        likes: tagStats[tag].likes
      }))
      .sort((a, b) => b.posts - a.posts || b.likes - a.likes)
      .slice(0, 8)
      .map(({ tag, posts }) => ({ tag, posts })); // match old response format

    res.json({ success: true, trending });
  } catch (err) {
    console.error('GetTrending error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch trending topics.' });
  }
};

// ─────────────────────────────────────────
// GET /api/posts/:id
// ─────────────────────────────────────────
exports.getPost = async (req, res) => {
  try {
    const supabase = getSupabase();
    const { data: post, error } = await supabase
      .from('posts')
      .select(`
        *,
        author:users!posts_author_id_fkey(id, name, username, avatar, level),
        comments(
          *,
          author:users!comments_author_id_fkey(id, name, username, avatar)
        )
      `)
      .eq('id', req.params.id)
      .maybeSingle();

    if (error || !post) return res.status(404).json({ success: false, message: 'Post not found.' });

    res.json({ success: true, post });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch post.' });
  }
};

// ─────────────────────────────────────────
// PUT /api/posts/:id
// ─────────────────────────────────────────
exports.updatePost = async (req, res) => {
  try {
    const supabase = getSupabase();
    const userId = req.user.id || req.user._id;

    // Check author
    const { data: existing, error: findError } = await supabase
      .from('posts')
      .select('author_id')
      .eq('id', req.params.id)
      .maybeSingle();
      
    if (findError || !existing) return res.status(404).json({ success: false, message: 'Post not found.' });
    if (existing.author_id !== userId) {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this post.' });
    }

    const { content } = req.body;
    const hashtags = content ? (content.match(/#[a-zA-Z0-9_]+/g) || []).map(t => t.slice(1).toLowerCase()) : undefined;

    const { data: post, error } = await supabase
      .from('posts')
      .update({ content, hashtags })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, post });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update post.' });
  }
};

// ─────────────────────────────────────────
// DELETE /api/posts/:id
// ─────────────────────────────────────────
exports.deletePost = async (req, res) => {
  try {
    const supabase = getSupabase();
    const userId = req.user.id || req.user._id;

    const { data: existing, error: findError } = await supabase
      .from('posts')
      .select('author_id')
      .eq('id', req.params.id)
      .maybeSingle();
      
    if (findError || !existing) return res.status(404).json({ success: false, message: 'Post not found.' });
    if (existing.author_id !== userId) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this post.' });
    }

    const { error } = await supabase.from('posts').delete().eq('id', req.params.id);
    if (error) throw error;

    res.json({ success: true, message: 'Post deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete post.' });
  }
};

// ─────────────────────────────────────────
// POST /api/posts/:id/like  (toggle)
// ─────────────────────────────────────────
exports.likePost = async (req, res) => {
  try {
    const supabase = getSupabase();
    const userId = req.user.id || req.user._id;
    const postId = req.params.id;

    // Check if post exists
    const { data: post, error: findError } = await supabase
      .from('posts')
      .select('author_id')
      .eq('id', postId)
      .maybeSingle();

    if (findError || !post) return res.status(404).json({ success: false, message: 'Post not found.' });

    // Check if already liked
    const { data: existingLike } = await supabase
      .from('post_likes')
      .select('user_id')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .maybeSingle();

    let liked = false;
    if (existingLike) {
      // Unlike
      await supabase.from('post_likes').delete().eq('post_id', postId).eq('user_id', userId);
    } else {
      // Like
      await supabase.from('post_likes').insert([{ post_id: postId, user_id: userId }]);
      liked = true;

      // Notify and award XP
      if (post.author_id !== userId) {
        await supabase.from('notifications').insert([{
          recipient_id: post.author_id,
          sender_id: userId,
          type: 'like',
          message: 'liked your post ❤️',
          post_id: postId,
        }]);

        const { data: authorData } = await supabase.from('users').select('xp').eq('id', post.author_id).single();
        if (authorData) {
          await supabase.from('users').update({ xp: authorData.xp + 2 }).eq('id', post.author_id);
        }
      }
    }

    // Get new count
    const { count } = await supabase
      .from('post_likes')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', postId);

    res.json({ success: true, liked, likesCount: count || 0 });
  } catch (err) {
    console.error('LikePost error:', err);
    res.status(500).json({ success: false, message: 'Failed to toggle like.' });
  }
};

// ─────────────────────────────────────────
// POST /api/posts/:id/comment
// ─────────────────────────────────────────
exports.commentOnPost = async (req, res) => {
  try {
    const supabase = getSupabase();
    const userId = req.user.id || req.user._id;
    const postId = req.params.id;
    const { content } = req.body;

    if (!content) return res.status(400).json({ success: false, message: 'Comment content is required.' });

    // Check if post exists
    const { data: post, error: findError } = await supabase
      .from('posts')
      .select('author_id')
      .eq('id', postId)
      .maybeSingle();

    if (findError || !post) return res.status(404).json({ success: false, message: 'Post not found.' });

    // Insert comment
    const { data: comment, error } = await supabase
      .from('comments')
      .insert([{ post_id: postId, author_id: userId, content }])
      .select('*, author:users!comments_author_id_fkey(id, name, username, avatar)')
      .single();

    if (error) throw error;

    // Notify author
    if (post.author_id !== userId) {
      await supabase.from('notifications').insert([{
        recipient_id: post.author_id,
        sender_id: userId,
        type: 'comment',
        message: 'commented on your post 💬',
        post_id: postId,
      }]);
      
      const { data: authorData } = await supabase.from('users').select('xp').eq('id', post.author_id).single();
      if (authorData) {
        await supabase.from('users').update({ xp: authorData.xp + 3 }).eq('id', post.author_id);
      }
    }

    // Get new count
    const { count } = await supabase
      .from('comments')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', postId);

    res.json({ success: true, comment, commentsCount: count || 0 });
  } catch (err) {
    console.error('CommentOnPost error:', err);
    res.status(500).json({ success: false, message: 'Failed to add comment.' });
  }
};

// ─────────────────────────────────────────
// GET /api/posts/:id/comments
// ─────────────────────────────────────────
exports.getComments = async (req, res) => {
  try {
    const supabase = getSupabase();
    const postId = req.params.id;

    const { data: comments, error } = await supabase
      .from('comments')
      .select('*, author:users!comments_author_id_fkey(id, name, username, avatar)')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    res.json({ success: true, comments });
  } catch (err) {
    console.error('GetComments error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch comments.' });
  }
};
