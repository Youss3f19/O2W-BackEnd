// models/GiftCard.js
const mongoose = require('mongoose');

const giftCardSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
  },
  value: {
    type: Number,
    required: true,
  },
  isRedeemed: {
    type: Boolean,
    default: false,
  },
  redeemedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },

}, { timestamps: true });

module.exports = mongoose.model('GiftCard', giftCardSchema);
