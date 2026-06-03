const express = require('express');
const { registerMember, loginMember, getMembers } = require('../controllers/memberController');
const router = express.Router();

router.post('/register', registerMember);
router.post('/login', loginMember);
router.get('/', getMembers);

module.exports = router;
