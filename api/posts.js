const express = require('express');
const postsRouter = express.Router();
const {getAllPosts, createPost} = require('../db');
const { requireUser } = require('./utils');

// POST /api/posts
//requireUser is middleware
//async req res next is handler function
postsRouter.post('/', requireUser, async (req, res, next) => {
  // res.send({ message: 'under construction' });
  const { title, content, tags = "" } = req.body;

  const tagArr = tags.trim().split(/\s+/)
  const postData = { authorId: req.user.id, title, content };

  if (tagArr.length) {
    postData.tags = tagArr;
  }

  try {
    const { authorId, title, content, } = postData;

    const post = await createPost(postData);

    if (post) {
      res.send({ post });
    } else {
      next({
      name: 'PostRouterError',
      message: 'The post route is incorrect'
      })
    }

  } catch ({ name, message}) {
    next({ name, message });
  }
})

postsRouter.patch('/:postId', requireUser, async (req, res, next) => {
  const { postId } = req.params;
  const { title, content, tags } = req.body;

  const updateFields = {};

  if (tags && tags.length > 0) {
    updateFields.tags = tags.trim().split(/\s+/);
  }

  if (title) {
    updateFields.title = title;
  }

  if (content) {
    updateFields.content = content;
  }

  try {
    const originalPost = await getPostById(postId);

    if (originalPost.author.id === req.user.id) {
      const updatedPost = await updatePost(postId, updateFields);
      res.send({ post: updatedPost })
    } else {
      next({
        name: 'UnauthorizedUserError',
        message: 'You cannot update a post that is not yours'
      })
    }
  } catch ({ name, message }) {
    next({ name, message });
  }
});

postsRouter.use((req, res, next) => {
  console.log("A request is being made to /posts");

  // res.send({ message: 'hello from /users!' });
  next();
});

postsRouter.get('/', async (req, res) => {
  const posts = await getAllPosts();

  res.send({
    posts
  });
});

module.exports = postsRouter;
