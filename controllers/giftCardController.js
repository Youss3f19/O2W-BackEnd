const GiftCard = require('../models/giftCard');
const User = require('../models/user');  
const { v4: uuidv4 } = require('uuid');


// Get all gift cards
exports.getAllGiftCards = async (req, res) => {
  try {
    const giftCards = await GiftCard.find();
    res.send(giftCards);
  } catch (err) {
    res.status(500).send(err);
  }
};

// Redeem a gift card
exports.redeemGiftCard = async (req, res) => {
  try {
    const userId = req.user._id; 
    const { code } = req.body;
    

    // Find the gift card by its code
    const giftCard = await GiftCard.findOne({ code });
    if (!giftCard) {
      return res.status(404).send({ message: 'Gift card not found' });
    }
    if (giftCard.isRedeemed) {
      return res.status(400).send({ message: 'Gift card already redeemed' });
    }

    // Mark the gift card as redeemed
    giftCard.isRedeemed = true;
    giftCard.redeemedBy = userId;
    await giftCard.save();

    // Add the gift card value to the user's solde
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send({ message: 'User not found' });
    }

    user.solde += giftCard.value;
    await user.save();

    // Respond with success
    res.send({
      message: 'Gift card redeemed and solde updated',
      giftCard,
      updatedSolde: user.solde,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
};




exports.generateGiftCards = async (req, res) => {
  try {

    const { numberOfCards, value } = req.body;

    if (!numberOfCards || numberOfCards <= 0) {
      return res.status(400).send({ message: 'Invalid number of cards specified.' });
    }

    const giftCards = [];
    for (let i = 0; i < numberOfCards; i++) {
      giftCards.push({
        code: uuidv4(),
        value,
      });
    }

    const createdGiftCards = await GiftCard.insertMany(giftCards);

    res.status(201).send({
      message: `${numberOfCards} gift cards generated successfully.`,
      giftCards: createdGiftCards,
    });
  } catch (err) {
    res.status(500).send(err);
  }
};
