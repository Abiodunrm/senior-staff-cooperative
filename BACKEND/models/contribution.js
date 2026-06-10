const mongoose = require('mongoose');

const contributionSchema = mongoose.Schema({
  member: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.models.Contribution || mongoose.model('Contribution', contributionSchema);
