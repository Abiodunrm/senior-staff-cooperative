const mongoose = require('mongoose');

const loanSchema = mongoose.Schema({
  member: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
  amount: { type: Number, required: true },
  durationMonths: { type: Number, required: true }, // applicant input
  interestRate: { type: Number }, // set in controller
  status: { type: String, enum: ['pending', 'approved', 'repaid'], default: 'pending' },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date } // set in controller
}, { timestamps: true });

module.exports = mongoose.model('Loan', loanSchema);


