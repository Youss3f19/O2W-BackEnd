const Category = require('../models/category'); // Adjust the path to where your Category model is located

// Create a new category
exports.createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;

        const category = new Category({ name, description });
        await category.save();

        res.status(201).json({
            message: 'Category created successfully',
            data: category,
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Category already exists' });
        }
        res.status(500).json({ message: 'Error creating category', error });
    }
};

// Get all categories
exports.getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find();
        res.status(200).json(categories);  // Return only the categories array
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving categories', error });
    }
};


// Get category by ID
exports.getCategoryById = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.status(200).json({
            message: 'Category retrieved successfully',
            data: category,
        });
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving category', error });
    }
};

// Update a category
exports.updateCategory = async (req, res) => {
    try {
        const { name, description } = req.body;
        const category = await Category.findByIdAndUpdate(
            req.params.id,
            { name, description },
            { new: true, runValidators: true }
        );

        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        res.status(200).json({
            message: 'Category updated successfully',
            data: category,
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Category already exists' });
        }
        res.status(500).json({ message: 'Error updating category', error });
    }
};

// Delete a category
exports.deleteCategory = async (req, res) => {
    try {
        const category = await Category.findByIdAndDelete(req.params.id);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.status(200).json({
            message: 'Category deleted successfully',
        });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting category', error });
    }
};
