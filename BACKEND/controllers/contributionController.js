const Contribution = require('../models/Contribution');

const addContribution = async (req, res) => {
  const { amount } = req.body;
  const contribution = await Contribution.create({ member: req.member._id, amount });
  res.json(contribution);
};

const getContributions = async (req, res) => {
  const contributions = await Contribution.find({ member: req.member._id });
  res.json(contributions);
};

module.exports = { addContribution, getContributions };
