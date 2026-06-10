const Contribution = require('../models/contribution');
const Member = require('../models/Member');

// @desc    Add a contribution (Admin only)
// @route   POST /api/contributions/add
// @access  Private/Admin
const addContribution = async (req, res) => {
  try {
    const { amount, memberId } = req.body;
    const parsedAmount = Number(amount);

    if (!memberId) {
      return res.status(400).json({ message: 'Member is required.' });
    }

    if (!parsedAmount || parsedAmount <= 0) {
      return res.status(400).json({ message: 'Invalid contribution amount.' });
    }

    const member = await Member.findById(memberId);
    if (!member) {
      return res.status(404).json({ message: 'Member not found.' });
    }

    const contribution = await Contribution.create({
      member: member._id,
      amount: parsedAmount,
      date: new Date()
    });

    member.contribution = (Number(member.contribution) || 0) + parsedAmount;
    await member.save();

    const populatedContribution = await Contribution.findById(contribution._id)
      .populate('member', 'name email');

    res.status(201).json({
      amount: populatedContribution.amount,
      member: populatedContribution.member,
      date: populatedContribution.date
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Server error adding contribution' });
  }
};









// @desc    Get contributions (Admin can filter by memberId)
// @route   GET /api/contributions?memberId=xxx
// @access  Private
const getContributions = async (req, res) => {
  try {
    const { memberId } = req.query;
    const filter = memberId ? { member: memberId } : { member: req.member._id };

    const contributions = await Contribution.find(filter).populate('member', 'name email');
    res.json(contributions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching contributions' });
  }
};

module.exports = { addContribution, getContributions };
