
const express = require('express');
const { addContribution, getContributions } = require('../controllers/contributionController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/add', protect, admin, addContribution); // admin only
router.get('/', protect, getContributions);

module.exports = router;



