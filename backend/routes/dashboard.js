const express = require('express');
const Transaction = require('../models/Transaction');
const auth = require('../middleware/auth');

const router = express.Router();

// Get dashboard statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    
    // Calculate date range
    const now = new Date();
    let startDate;
    
    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    // Get current period stats
    const currentStats = await Transaction.aggregate([
      {
        $match: {
          userId: req.userId,
          date: { $gte: startDate, $lte: now }
        }
      },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Get all-time stats
    const allTimeStats = await Transaction.aggregate([
      {
        $match: { userId: req.userId }
      },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Format results
    const formatStats = (stats) => {
      const result = { income: 0, expense: 0, balance: 0 };
      stats.forEach(stat => {
        result[stat._id] = stat.total;
      });
      result.balance = result.income - result.expense;
      return result;
    };

    const current = formatStats(currentStats);
    const allTime = formatStats(allTimeStats);

    res.json({
      current: {
        ...current,
        period
      },
      allTime
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get chart data for categories
router.get('/charts/categories', auth, async (req, res) => {
  try {
    const { period = 'month', type = 'expense' } = req.query;
    
    // Calculate date range
    const now = new Date();
    let startDate;
    
    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const categoryData = await Transaction.aggregate([
      {
        $match: {
          userId: req.userId,
          type: type,
          date: { $gte: startDate, $lte: now }
        }
      },
      {
        $lookup: {
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'categoryInfo'
        }
      },
      {
        $unwind: '$categoryInfo'
      },
      {
        $group: {
          _id: '$category',
          name: { $first: '$categoryInfo.name' },
          icon: { $first: '$categoryInfo.icon' },
          color: { $first: '$categoryInfo.color' },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { total: -1 }
      }
    ]);

    res.json(categoryData);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get spending trend data
router.get('/charts/trend', auth, async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    
    // Calculate date range and grouping
    const now = new Date();
    let startDate, groupFormat;
    
    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        groupFormat = { $dateToString: { format: '%Y-%m-%d', date: '$date' } };
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        groupFormat = { $dateToString: { format: '%Y-%m-%d', date: '$date' } };
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        groupFormat = { $dateToString: { format: '%Y-%m', date: '$date' } };
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        groupFormat = { $dateToString: { format: '%Y-%m-%d', date: '$date' } };
    }

    const trendData = await Transaction.aggregate([
      {
        $match: {
          userId: req.userId,
          date: { $gte: startDate, $lte: now }
        }
      },
      {
        $group: {
          _id: {
            date: groupFormat,
            type: '$type'
          },
          total: { $sum: '$amount' }
        }
      },
      {
        $group: {
          _id: '$_id.date',
          income: {
            $sum: {
              $cond: [{ $eq: ['$_id.type', 'income'] }, '$total', 0]
            }
          },
          expense: {
            $sum: {
              $cond: [{ $eq: ['$_id.type', 'expense'] }, '$total', 0]
            }
          }
        }
      },
      {
        $addFields: {
          date: '$_id',
          balance: { $subtract: ['$income', '$expense'] }
        }
      },
      {
        $sort: { date: 1 }
      }
    ]);

    res.json(trendData);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get recent transactions
router.get('/recent', auth, async (req, res) => {
  try {
    const { limit = 5 } = req.query;

    const recentTransactions = await Transaction.find({ userId: req.userId })
      .populate('category', 'name icon color')
      .sort({ date: -1 })
      .limit(parseInt(limit));

    res.json(recentTransactions);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
