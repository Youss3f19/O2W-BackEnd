const express = require('express');
const router = express.Router();
const CategoryController = require('../controllers/categoryController');

// Define routes
router.post('/categories',  CategoryController.createCategory);
router.get('/categories', CategoryController.getAllCategories);
router.get('/categories/:id', CategoryController.getCategoryById);
router.put('/categories/:id', CategoryController.updateCategory);
router.delete('/categories/:id', CategoryController.deleteCategory);

module.exports = router;
