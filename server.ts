import express from 'express';
import walletRoutes from './src/routes/wallet.routes';

const app = express();

// Middleware
app.use(express.json());

// Routes
app.use('/api', walletRoutes);

// Start the server
app.listen(3000, () => {
  console.log('Server running on port 3000');
});