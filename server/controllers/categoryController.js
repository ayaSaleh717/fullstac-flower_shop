import Category from '../models/categorys.model.js';

// Get all categories
const getCategories = async (req, res) => {
    try {
        const categories = await Category.find({});
        res.status(200).json(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Add a new category
const addCategory = async (req, res) => {
    try {
        const { catName } = req.body;
        
        if (!catName) {
            return res.status(400).json({ message: 'Category name is required' });
        }
        
        const newCategory = new Category({ catName });
        await newCategory.save();
        
        res.status(201).json(newCategory);
    } catch (error) {
        console.error('Error adding category:', error);
        if (error.code === 11000) { // Duplicate key error
            return res.status(400).json({ message: 'Category already exists' });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Delete a category
const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const category = await Category.findByIdAndDelete(id);
        
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        
        res.status(200).json({ message: 'Category deleted successfully' });
    } catch (error) {
        console.error('Error deleting category:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export { 
    getCategories,
    addCategory,
    deleteCategory
};
