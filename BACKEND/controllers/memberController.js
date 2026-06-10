const Member = require('../models/Member');
const Contribution = require('../models/contribution');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const generateToken = require('../utils/generateToken');

const registerMember = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const memberExists = await Member.findOne({ email });

    if (memberExists) {
      return res.status(400).json({ message: 'Member already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const member = await Member.create({ name, email, password: hashedPassword });

    res.status(201).json({
      _id: member._id,
      name: member.name,
      email: member.email,
      token: generateToken(member._id)
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Registration failed' });
  }
};



const loginMember = async (req, res) => {
  const { email, password } = req.body;
  const member = await Member.findOne({ email });

  if (member && await bcrypt.compare(password, member.password)) {
    res.json({
      _id: member._id,
      name: member.name,
      email: member.email,
      contribution: member.contribution,
      token: generateToken(member._id)
    });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
};


// @desc    Get all members
// @route   GET /api/members
// @access  Private/Admin
// @desc    Get all members with total contributions
// @route   GET /api/members
// @access  Private/Admin
const getMembers = async (req, res) => {
  try {
    const members = await Member.find().select('name email');

    // For each member, calculate total contributions
    const membersWithTotals = await Promise.all(
      members.map(async (m) => {
        const total = await Contribution.aggregate([
          { $match: { member: m._id } },
          { $group: { _id: null, sum: { $sum: "$amount" } } }
        ]);
        return {
          _id: m._id,
          name: m.name,
          email: m.email,
          contribution: total.length > 0 ? total[0].sum : 0
        };
      })
    );

    res.json(membersWithTotals);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching members' });
  }
};


module.exports = { registerMember, loginMember, getMembers };
