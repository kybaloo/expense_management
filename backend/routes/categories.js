const express = require('express');
const Category = require('../models/Category');
const auth = require('../middleware/auth');

const router = express.Router();

// Default categories
const defaultCategories = [
  { name: 'Food & Dining', icon: '🍽️', color: '#FF6B6B' },
  { name: 'Transportation', icon: '🚗', color: '#4ECDC4' },
  { name: 'Shopping', icon: '🛍️', color: '#45B7D1' },
  { name: 'Entertainment', icon: '🎬', color: '#96CEB4' },
  { name: 'Bills & Utilities', icon: '⚡', color: '#FFEAA7' },
  { name: 'Healthcare', icon: '🏥', color: '#DDA0DD' },
  { name: 'Education', icon: '📚', color: '#98D8C8' },
  { name: 'Travel', icon: '✈️', color: '#F7DC6F' },
  { name: 'Salary', icon: '💰', color: '#82E0AA' },
  { name: 'Investment', icon: '📈', color: '#85C1E9' },
  { name: 'Other Income', icon: '💵', color: '#F8C471' },
  { name: 'Other Expense', icon: '💸', color: '#EC7063' }
];

// Initialize default categories
const initializeDefaultCategories = async () => {
  try {
    const existingCategories = await Category.find({ isCustom: false });
    if (existingCategories.length === 0) {
      await Category.insertMany(defaultCategories.map(cat => ({ ...cat, isCustom: false })));
      console.log('Default categories initialized');
    }
  } catch (error) {
    console.error('Error initializing default categories:', error);
  }
};

// Initialize on startup
initializeDefaultCategories();

// Get all categories (default + user's custom)
router.get('/', auth, async (req, res) => {
  try {
    const categories = await Category.find({
      $or: [
        { isCustom: false },
        { isCustom: true, userId: req.userId }
      ]
    }).sort({ isCustom: 1, name: 1 });

    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create custom category
router.post('/', auth, async (req, res) => {
  try {
    const { name, icon, color } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Category name is required' });
    }

    const category = new Category({
      name,
      icon: icon || '📁',
      color: color || '#3B82F6',
      isCustom: true,
      userId: req.userId
    });

    await category.save();
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update category (only custom categories)
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, icon, color } = req.body;
    
    const category = await Category.findOne({
      _id: req.params.id,
      isCustom: true,
      userId: req.userId
    });

    if (!category) {
      return res.status(404).json({ message: 'Category not found or not editable' });
    }

    category.name = name || category.name;
    category.icon = icon || category.icon;
    category.color = color || category.color;

    await category.save();
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete category (only custom categories)
router.delete('/:id', auth, async (req, res) => {
  try {
    const category = await Category.findOneAndDelete({
      _id: req.params.id,
      isCustom: true,
      userId: req.userId
    });

    if (!category) {
      return res.status(404).json({ message: 'Category not found or not deletable' });
    }

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
