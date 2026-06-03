const express = require('express');
const { applyLoan, getLoans } = require('../controllers/loanController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/apply', protect, applyLoan);
router.get('/', protect, getLoans);

module.exports = router;
