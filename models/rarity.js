const mongoose = require('mongoose');

const RaritySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        order: {
            type: Number,
            required: true,
        },
    },
    { timestamps: true }
);

const Rarity = mongoose.model('Rarity', RaritySchema);
module.exports = Rarity;
