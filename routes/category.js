const express = require('express');
const router = express.Router();
const CategoryController = require('../controllers/categoryController');
const { upload } = require("../middleware/multerMiddleware");

// Define routes
router.post('/addCategory', upload.single('file') , CategoryController.createCategory);
router.get('/categories', CategoryController.getAllCategories);
router.get('/categories/:id', CategoryController.getCategoryById);
router.put('/updateCategory/:id', upload.single('file'), CategoryController.updateCategory);
router.delete('/deleteCategory/:id', CategoryController.deleteCategory);

module.exports = router;
