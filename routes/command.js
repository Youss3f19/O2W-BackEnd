const express = require('express');
const router = express.Router();
const commandController = require('../controllers/commandController');
const auth = require('../middleware/auth');
    

router.get('/getAllCommands', commandController.getAllCommands);

router.post('/create', auth ,  commandController.createCommand);

router.put('/updateCommandStatus/:commandId',auth,  commandController.updateCommandStatus);

module.exports = router;
