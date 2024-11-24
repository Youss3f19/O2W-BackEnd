const mongoose = require('mongoose'); 

const BoxSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
        },
        price: {    
            type: Number,
            required: true
        },
        boxImage:{
            type: String,
        },
        rarityProbabilities: [
            {
                rarity: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Rarity',
                    required: true,
                },
                probability: {
                    type: Number,
                    required: true
                }
            }
        ],
        productLimit: {  
            type: Number,
            required: true,
            default: 5 
        },
        categories: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Category'
            }
        ]

    },
    { timestamps: true }
);
BoxSchema.index({ 'rarityProbabilities.rarity': 1 }, { unique: false });
const Box = mongoose.model('Box', BoxSchema);
module.exports = Box;
