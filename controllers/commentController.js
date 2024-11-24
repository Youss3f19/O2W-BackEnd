const Comment = require('../models/comment');
const Box = require('../models/box');
const User = require('../models/user');


// Ajouter un commentaire
exports.addComment = async (req, res) => {
    try {
        const { content, boxId } = req.body;
        const userId = req.user._id; 

        const boxExists = await Box.findById(boxId);
        if (!boxExists) {
            return res.status(404).json({ message: 'Box not found' });
        }

        const comment = new Comment({
            content,
            user: userId,
            box: boxId,
        });

        await comment.save();
        res.status(201).json({ message: 'Comment added successfully', comment });
    } catch (error) {
        res.status(500).json({ message: 'Error adding comment', error: error.message });
    }
};

// Récupérer tous les commentaires d'une box
exports.getCommentsByBox = async (req, res) => {
    try {
        const { boxId } = req.params;

        const comments = await Comment.find({ box: boxId })
            .populate('user','_id name lastname') 
            .sort({ createdAt: -1 }); 

        res.status(200).json(comments);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching comments', error: error.message });
    }
};

// Supprimer un commentaire
exports.deleteComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const userId = req.user._id; 

        const comment = await Comment.findById(commentId);
        const user = await User.findById(userId);
        console.log(user.role);
        
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        if (comment.user.toString() !== userId.toString() && user.role.toString() !== "admin") {
            return res.status(403).json({ message: 'Unauthorized to delete this comment' });
        }

        await comment.deleteOne();
        res.status(200).json({ message: 'Comment deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting comment', error: error.message });
    }
};
