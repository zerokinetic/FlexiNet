const express = require('express');
const supabase = require('./supabaseClient');
const userRoutes = require('./userRoutes');
const clientSubscriptionRoutes = require('./clientSubscriptionRoutes');
const adminSubscriptionRoutes = require('./adminSubscriptionRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// User routes
app.use('/api/user', userRoutes);
// Client subscription routes
app.use('/api/clientsubscription', clientSubscriptionRoutes);
// Admin subscription routes
app.use('/api/adminsubscription', adminSubscriptionRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
