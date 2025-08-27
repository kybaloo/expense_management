const express = require('express');
const { body, validationResult } = require('express-validator');
const Transaction = require('../models/Transaction');
const Category = require('../models/Category');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all transactions for user
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, type, category, startDate, endDate, search } = req.query;
    
    // Build query
    const query = { userId: req.userId };
    
    if (type && ['income', 'expense'].includes(type)) {
      query.type = type;
    }
    
    if (category) {
      query.category = category;
    }
    
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    if (search) {
      query.description = { $regex: search, $options: 'i' };
    }

    const transactions = await Transaction.find(query)
      .populate('category', 'name icon color')
      .sort({ date: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Transaction.countDocuments(query);

    res.json({
      transactions,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get transaction by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      userId: req.userId
    }).populate('category', 'name icon color');

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    res.json(transaction);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create new transaction
router.post('/', auth, [
  body('amount').isNumeric().withMessage('Amount must be a number'),
  body('description').trim().isLength({ min: 1 }).withMessage('Description is required'),
  body('type').isIn(['income', 'expense']).withMessage('Type must be income or expense'),
  body('category').isMongoId().withMessage('Valid category ID is required'),
  body('date').optional().isISO8601().withMessage('Date must be valid')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { amount, description, type, category, date } = req.body;

    // Verify category exists and user has access
    const categoryDoc = await Category.findOne({
      _id: category,
      $or: [
        { isCustom: false },
        { isCustom: true, userId: req.userId }
      ]
    });

    if (!categoryDoc) {
      return res.status(400).json({ message: 'Invalid category' });
    }

    const transaction = new Transaction({
      amount: Math.abs(amount), // Ensure positive amount
      description,
      type,
      category,
      date: date ? new Date(date) : new Date(),
      userId: req.userId
    });

    await transaction.save();
    await transaction.populate('category', 'name icon color');

    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update transaction
router.put('/:id', auth, [
  body('amount').optional().isNumeric().withMessage('Amount must be a number'),
  body('description').optional().trim().isLength({ min: 1 }).withMessage('Description cannot be empty'),
  body('type').optional().isIn(['income', 'expense']).withMessage('Type must be income or expense'),
  body('category').optional().isMongoId().withMessage('Valid category ID is required'),
  body('date').optional().isISO8601().withMessage('Date must be valid')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { amount, description, type, category, date } = req.body;

    const transaction = await Transaction.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Verify category if provided
    if (category) {
      const categoryDoc = await Category.findOne({
        _id: category,
        $or: [
          { isCustom: false },
          { isCustom: true, userId: req.userId }
        ]
      });

      if (!categoryDoc) {
        return res.status(400).json({ message: 'Invalid category' });
      }
    }

    // Update fields
    if (amount !== undefined) transaction.amount = Math.abs(amount);
    if (description !== undefined) transaction.description = description;
    if (type !== undefined) transaction.type = type;
    if (category !== undefined) transaction.category = category;
    if (date !== undefined) transaction.date = new Date(date);

    await transaction.save();
    await transaction.populate('category', 'name icon color');

    res.json(transaction);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete transaction
router.delete('/:id', auth, async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get transactions summary
router.get('/summary/stats', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const matchQuery = { userId: req.userId };
    if (startDate && endDate) {
      matchQuery.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const summary = await Transaction.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    const result = {
      income: { total: 0, count: 0 },
      expense: { total: 0, count: 0 },
      balance: 0
    };

    summary.forEach(item => {
      result[item._id] = { total: item.total, count: item.count };
    });

    result.balance = result.income.total - result.expense.total;

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
