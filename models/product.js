const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: false
        },
        
        price: {
            type: Number,
            required: true
        },
        productImage:{
            type: String,
        },
        categories: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Category',
            }
        ],
        stock: {
            type: Number,
            default: 0
        },
        rarity: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Rarity',
            required: true 
        }
    },
    { timestamps: true }
);

const Product = mongoose.model('Product', ProductSchema);
module.exports = Product;
