
const express = require('express');
const { applyLoan, getLoans, updateLoanStatus } = require('../controllers/loanController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/apply', protect, applyLoan);
router.get('/', protect, getLoans);
router.put('/:id/status', protect, admin, updateLoanStatus); // admin only

module.exports = router;



