const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const memberRoutes = require('./routes/memberRoutes');
const projectRoutes = require('./routes/projectRoutes');
const loanRoutes = require('./routes/loanRoutes');
const contributionRoutes = require('./routes/contributionRoutes');


dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());


// Routes
app.use('/api/members', memberRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/contributions', contributionRoutes);

const PORT = process.env.PORT || 5000;

// Connect to DB then start server
connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port http://localhost:${PORT}`));
}).catch(err => {
  console.error('Failed to connect to MongoDB:', err);
  process.exit(1);
});
