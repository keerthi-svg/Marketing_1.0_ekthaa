require('dotenv').config();
const { getSupabase, connectDB } = require('./config/db');
const bcrypt = require('bcryptjs');

connectDB().then(async () => {
  const supabase = getSupabase();
  const { data: users, error: userErr } = await supabase.from('users').select('*');
  if (userErr) {
    console.error('User fetch error:', userErr);
    process.exit(1);
  }

  const { data: posts, error: postErr } = await supabase.from('posts').select('*');
  if (postErr) {
    console.error('Post fetch error:', postErr);
    process.exit(1);
  }

  if (!users || users.length === 0 || !posts || posts.length === 0) {
    console.error('No users or posts found. Run initial seed first.');
    process.exit(1);
  }

  // Add likes and comments to every post
  const dummyLikes = [];
  const dummyComments = [];

  posts.forEach((post, i) => {
    // Have the next 3 users like the post
    for(let j=1; j<=3; j++) {
      const liker = users[(i + j) % users.length];
      dummyLikes.push({ post_id: post.id, user_id: liker.id });
    }
    
    // Have the next 2 users comment on the post
    for(let j=1; j<=2; j++) {
      const commenter = users[(i + j + 2) % users.length];
      dummyComments.push({
        post_id: post.id,
        author_id: commenter.id,
        content: `Great thoughts! Really inspiring.`
      });
    }
  });

  const { error: likeErr } = await supabase.from('post_likes').insert(dummyLikes);
  if (likeErr) {
    console.error('Like insert error:', likeErr);
    // Ignore duplicate likes
  }

  const { error: commentErr } = await supabase.from('comments').insert(dummyComments);
  if (commentErr) {
    console.error('Comment insert error:', commentErr);
    // Ignore duplicate comments
  }

  console.log('Successfully added likes and comments to existing posts!');
  process.exit(0);
}).catch(console.error);
