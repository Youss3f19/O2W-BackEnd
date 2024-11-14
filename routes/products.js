const express = require('express');
const router = express.Router();
const ProductController = require('../controllers/productController');
const { upload } = require("../middleware/multerMiddleware");


// Define routes
router.post('/addProduct', upload.single('file'), ProductController.createProduct);
router.get('/products', ProductController.getAllProducts);
router.get('/product/:id', ProductController.getProductById);
router.put('/updateProduct/:id', ProductController.updateProduct);
router.delete('/products/:id', ProductController.deleteProduct);

module.exports = router;
