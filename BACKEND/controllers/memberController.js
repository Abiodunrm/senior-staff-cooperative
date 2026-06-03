const Member = require('../models/Member');
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


const getMembers = async (req, res) => {
  try {
    const members = await Member.find({});
    res.json(members);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to fetch members' });
  }
};

module.exports = { registerMember, loginMember, getMembers };
