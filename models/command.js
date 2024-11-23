const mongoose = require('mongoose');

const CommandSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    products: [
        {
            product: {
               type: mongoose.Schema.Types.ObjectId, 
               ref: 'Product'
            },
            quantity: {
                type: Number,
                required: true,
            },
        },
    ],
    status: {
        type: String,
        enum: ['Pending', 'Completed', 'Cancelled'],
        default: 'Pending',
    },
}, { timestamps: true });

const Command = mongoose.model('Command', CommandSchema);
module.exports = Command;
