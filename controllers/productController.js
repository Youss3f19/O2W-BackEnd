const Product = require('../models/product'); // Adjust the path as necessary
const Category = require('../models/category'); // Make sure to require Category model for category validation
const Rarity = require('../models/rarity'); // Require the Rarity model

// Create a new product
exports.createProduct = async (req, res) => {
    try {
      const { name, description, price, categories, stock, rarity } = req.body;
      console.log('Received categories:', categories);  // Check how the categories are being received
      
      // Ensure categories are passed as an array of strings (ObjectId format)
      const categoryIds = Array.isArray(categories) ? categories : JSON.parse(categories);
      const productImage = req.file ? req.file.path : null;  
        console.log(productImage);
        
      // Validate categories (check if all category IDs are valid)
      if (categoryIds && categoryIds.length > 0) {
        const validCategories = await Category.find({ _id: { $in: categoryIds } });
        if (validCategories.length !== categoryIds.length) {
          return res.status(400).json({ message: 'Some categories do not exist' });
        }
      }
  
      // Validate rarity
      if (!rarity) {
        return res.status(400).json({ message: 'Rarity is required' });
      }
  
      const validRarity = await Rarity.findById(rarity);
      if (!validRarity) {
        return res.status(400).json({ message: 'Rarity does not exist' });
      }
  
      const product = new Product({ name, description, price, productImage ,categories: categoryIds, stock, rarity });
      await product.save();
  
      res.status(201).json({
        message: 'Product created successfully',
        data: product,
      });
    } catch (error) {
      res.status(500).json({ message: 'Error creating product', error: error.message });
    }
  };
  


// Get all products
exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.find().populate('categories rarity'); // Populate categories and rarity for better detail
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving products', error: error.message });
    }
};

// Get product by ID
exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('categories rarity'); // Populate categories and rarity
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving product', error: error.message });
    }
};

// Update a product
exports.updateProduct = async (req, res) => {
    try {
        const { name, description, price, categories, stock, rarity } = req.body;

        // Validate categories
        if (categories && categories.length > 0) {
            const validCategories = await Category.find({ _id: { $in: categories } });
            if (validCategories.length !== categories.length) {
                return res.status(400).json({ message: 'Some categories do not exist' });
            }
        }

        // Validate rarity if provided
        if (rarity) {
            const validRarity = await Rarity.findById(rarity);
            if (!validRarity) {
                return res.status(400).json({ message: 'Rarity does not exist' });
            }
        }

        const product = await Product.findByIdAndUpdate(
            req.params.id,
            { name, description, price, categories, stock, rarity }, // Include rarity for update
            { new: true, runValidators: true }
        );

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.status(200).json({
            message: 'Product updated successfully',
            data: product,
        });
    } catch (error) {
        res.status(500).json({ message: 'Error updating product', error: error.message });
    }
};

// Delete a product
exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json({
            message: 'Product deleted successfully',
        });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting product', error: error.message });
    }
};