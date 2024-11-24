const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const auth = require('../middleware/auth');

router.post('/addComment', auth, commentController.addComment);

router.get('/getCommentsByBoxId/:boxId', commentController.getCommentsByBox);

router.delete('/deleteComment/:commentId', auth, commentController.deleteComment);






module.exports = router;
