const express = require('express');
const router = express.Router();
const giftCardController = require('../controllers/giftCardController');
const auth = require('../middleware/auth');
const authorize = require("../middleware/authorize");



router.get('/', giftCardController.getAllGiftCards);
router.post('/redeem',auth, giftCardController.redeemGiftCard);
router.post('/generate',auth, authorize("admin") ,giftCardController.generateGiftCards);


module.exports = router;
