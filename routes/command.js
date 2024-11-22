const express = require('express');
const router = express.Router();
const commandController = require('../controllers/commandController');
const auth = require('../middleware/auth');
    
router.post('/create', auth ,  commandController.createCommand);
router.put('/update/:commandId', commandController.updateCommandStatus);

module.exports = router;
