const mongoose = require('mongoose');

const memberSchema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  contribution: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Member', memberSchema);
