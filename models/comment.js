const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema(
    {
        content: {
            type: String,
            required: true,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        box: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Box',
            required: true,
        }
    },
    { timestamps: true }
);

const Comment = mongoose.model('Comment', CommentSchema);
module.exports = Comment;
