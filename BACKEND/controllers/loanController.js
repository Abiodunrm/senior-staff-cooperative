const Loan = require('../models/Loan');
const Contribution = require('../models/Contribution');

// @desc    Apply for a new loan
// @route   POST /api/loans/apply
// @access  Private
const applyLoan = async (req, res) => {
  try {
    const amount = Number(req.body.amount);
    const durationMonths = Number(req.body.durationMonths);

    if (!Number.isFinite(durationMonths) || durationMonths < 1 || durationMonths > 24) {
      return res.status(400).json({ message: 'Invalid loan duration. Must be between 1 and 24 months.' });
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({ message: 'Invalid loan amount.' });
    }

    // Calculate total contributions of the member
    const contributions = await Contribution.find({ member: req.member._id });
    const totalContribution = contributions.reduce((sum, c) => sum + c.amount, 0);

    // Eligibility checks
    if (amount > 2 * totalContribution) {
      return res.status(400).json({
        message: `Your maximum loan limit is 2 x totalContribution. Current limit: ₦${2 * totalContribution}`
      });
    }

    if (totalContribution < amount / 2) {
      return res.status(400).json({
        message: `You must have at least half of the loan amount in contributions. Current total: ₦${totalContribution}`
      });
    }

    // Interest rate logic
    let interestRate;
    if (durationMonths >= 1 && durationMonths <= 12) {
      interestRate = 5;
    } else if (durationMonths > 12 && durationMonths <= 18) {
      interestRate = 7.5;
    } else {
      interestRate = 10;
    }

    // End date logic (safe calculation)
    const startDate = new Date();
    const endDate = new Date(startDate);

    const totalMonths = endDate.getMonth() + durationMonths;
    const yearsToAdd = Math.floor(totalMonths / 12);
    const newMonth = totalMonths % 12;

    endDate.setFullYear(endDate.getFullYear() + yearsToAdd);
    endDate.setMonth(newMonth);

    // Repayment calculation
    const repaymentAmount = amount + (amount * (interestRate / 100));
    const monthlyRepayment = repaymentAmount / durationMonths;

    // Create loan
    const loan = await Loan.create({
      member: req.member._id,
      amount,
      durationMonths,
      interestRate,
      startDate,
      endDate,
      repaymentAmount,
      monthlyRepayment
    });

    res.status(201).json(loan);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error applying for loan' });
  }
};

// @desc    Get all loans for logged-in member
// @route   GET /api/loans
// @access  Private
const getLoans = async (req, res) => {
  try {
    const loans = await Loan.find({ member: req.member._id });
    res.json(loans);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching loans' });
  }
};

module.exports = { applyLoan, getLoans };


