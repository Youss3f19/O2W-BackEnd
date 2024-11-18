const express = require('express');
const router = express.Router();
const giftCardController = require('../controllers/giftCardController');
const auth = require('../middleware/auth');


router.post('/', giftCardController.createGiftCard);
router.get('/', giftCardController.getAllGiftCards);
router.post('/redeem',auth, giftCardController.redeemGiftCard);
router.delete('/:id', giftCardController.deleteGiftCard);
router.post('/generate', giftCardController.generateGiftCards);


module.exports = router;
