const express = require('express');
const router = express.Router();
const rarityController = require('../controllers/rarityController');

// Routes for rarity operations
router.post('/addRarity', rarityController.addRarity);
router.delete('/deleteRarity/:id', rarityController.deleteRarity);
router.put('/updateRarity/:id', rarityController.updateRarity);
router.get('/getAllRarity', rarityController.getAllRarities);
router.get('/getRarityById/:id', rarityController.getRarityById);

module.exports = router;
