// routes/postRoutes.js
const express = require('express');
const router  = express.Router();
const {
  createPost, getPosts, getPost,
  updatePost, deletePost, likePost, getTrending, commentOnPost, getComments
} = require('../controllers/postController');
const { protectRoute } = require('../middleware/auth');

router.get('/trending',      protectRoute, getTrending);
router.get('/',              protectRoute, getPosts);
router.post('/',             protectRoute, createPost);
router.get('/:id',           protectRoute, getPost);
router.put('/:id',           protectRoute, updatePost);
router.delete('/:id',        protectRoute, deletePost);
router.post('/:id/like',     protectRoute, likePost);
router.post('/:id/comment',  protectRoute, commentOnPost);
router.get('/:id/comments',  protectRoute, getComments);

module.exports = router;
