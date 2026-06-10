const Loan = require('../models/Loan');
const Contribution = require('../models/contribution');

// @desc    Apply for a new loan
// @route   POST /api/loans/apply
// @access  Private




const applyLoan = async (req, res) => {
  try {
    const amount = Number(req.body.amount);
    const durationMonths = Number(req.body.durationMonths);
    const loanType = String(req.body.loanType);

    if (!['Normal', 'Emergency', 'Commodity'].includes(loanType)) {
      return res.status(400).json({ message: 'Invalid loan type.' });
    }

    // Check if member already has an active loan of this type
    const existingLoan = await Loan.findOne({
      member: req.member._id,
      loanType,
      status: { $ne: 'repaid' } // not repaid yet
    });

    if (existingLoan) {
      return res.status(400).json({
        message: `You already have an active ${loanType} loan. You can only apply again once it is repaid.`
      });
    }

    // Special rules for Emergency & Commodity loans
    if (loanType === 'Emergency' || loanType === 'Commodity') {
      if (amount > 150000) {
        return res.status(400).json({ message: 'Maximum loan amount for Emergency/Commodity loans is ₦150,000.' });
      }
      if (durationMonths < 1 || durationMonths > 6) {
        return res.status(400).json({ message: 'Maximum duration for Emergency/Commodity loans is 6 months.' });
      }
    }

    // Normal loan rules
    if (loanType === 'Normal') {
      if (!Number.isFinite(durationMonths) || durationMonths < 1 || durationMonths > 24) {
        return res.status(400).json({ message: 'Invalid loan duration. Must be between 1 and 24 months for Normal loans.' });
      }
      if (!Number.isFinite(amount) || amount <= 0) {
        return res.status(400).json({ message: 'Invalid loan amount.' });
      }
    }

    // Calculate total contributions of the member
    const contributions = await Contribution.find({ member: req.member._id });
    const totalContribution = contributions.reduce((sum, c) => sum + c.amount, 0);

    // Eligibility checks (apply to all loan types)
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

    // End date logic
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
      monthlyRepayment,
      loanType,
      status: 'pending' // default status
    });

    res.status(201).json(loan);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error applying for loan' });
  }
};





// @desc    Get all loans (Admin only)
// @route   GET /api/loans
// @access  Private/Admin
const getLoans = async (req, res) => {
  try {
    const loans = await Loan.find().populate('member', 'name email');
    res.json(loans);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching loans' });
  }
};


// @desc    Update loan status (Admin only)
// @route   PUT /api/loans/:id/status
// @access  Private/Admin
const updateLoanStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const loanId = req.params.id;

    // Validate status
    const validStatuses = ['pending', 'approved', 'repaid', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid loan status.' });
    }

    // Find loan
    const loan = await Loan.findById(loanId);
    if (!loan) {
      return res.status(404).json({ message: 'Loan not found.' });
    }

    // Update status
    loan.status = status;
    await loan.save();

    res.json({ message: `Loan status updated to ${status}`, loan });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error updating loan status' });
  }
};


module.exports = { applyLoan, getLoans ,updateLoanStatus};


