const mongoose = require('mongoose');

const CommandSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',  
            required: true
        },
        products: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',  
                required: false
            }
        ],
        status: {
            type: String,
            enum: ['Pending', 'Completed', 'Cancelled'],  
            default: 'Pending'
        }
    },
    { timestamps: true }
);

const Command = mongoose.model('Command', CommandSchema);
module.exports = Command;
