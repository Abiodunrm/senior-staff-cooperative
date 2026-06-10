const mongoose = require('mongoose');

const loanSchema = mongoose.Schema({
  member: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
  amount: { type: Number, required: true },
  durationMonths: { type: Number, required: true }, // applicant input
  interestRate: { type: Number }, // set in controller
  repaymentAmount: { type: Number },
monthlyRepayment: { type: Number },
repaymentSchedule: [
  {
    month: Number,
    dueDate: Date,
    amount: Number
  }
],
loanType: {
  type: String,
  enum: ['Normal', 'Emergency', 'Commodity'],
  required: true
},

  status: { type: String, enum: ['pending', 'approved', 'repaid', 'rejected'], default: 'pending' },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date } // set in controller
}, { timestamps: true });





module.exports = mongoose.model('Loan', loanSchema);





