const express = require('express');
const router = express.Router();
const boxController = require('../controllers/boxController');
const auth = require('../middleware/auth');
const authorize = require("../middleware/authorize");
const { upload } = require("../middleware/multerMiddleware");


// Routes for box operations

router.get('/getBoxes',  boxController.getAllBoxes);  
router.get('/boxes/:boxId/open', auth, boxController.openBox);
router.get('/getBoxById/:boxId',  boxController.getBoxById);
router.get('/getProductsByBox/:boxId', boxController.getProductsByBox);
router.get('/purchaseLogs', boxController.getAllPurchaseLogs);



router.post('/purchaseBoxes', auth, boxController.purchaseBoxes);
router.post('/addBox', upload.single('file'), boxController.addBox);
router.post('/purchaseBox/:boxId', auth ,boxController.purchaseBox);

router.put('/updateBox/:id', upload.single('file'), boxController.updateBox);


router.delete('/deleteBox/:id',boxController.deleteBox);


module.exports = router;
