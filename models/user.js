const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        lastname: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true,
            unique: true
        },
        password: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            default : "user",
            required: true,
        },
        solde: {
            type: Number,
            default: 0
        },
        inventory: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Product'
                },
                quantity: {
                    type: Number,
                    default: 1
                }
            }
        ],
        boxes: [
            {
                box: { type: mongoose.Schema.Types.ObjectId, ref: 'Box' },
                opened: { type: Boolean, default: false },
                products: [  
                    {
                        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
                        quantity: { type: Number, default: 1 }
                    }
                ]
            }
        ]
    },
    { timestamps: true }
);

const User = mongoose.model('User', UserSchema);
module.exports = User;
