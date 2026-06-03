const express = require('express');
const { addContribution, getContributions } = require('../controllers/contributionController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/add', protect, addContribution);
router.get('/', protect, getContributions);

module.exports = router;
