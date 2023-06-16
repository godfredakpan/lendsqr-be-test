import express from 'express';
import * as walletController from '../controllers/walletController';

const router = express.Router();

// Create an account
router.post('/accounts/create', walletController.createAccount);

// Fund an account
router.post('/accounts/:id/fund', walletController.fundAccount);

// Transfer funds between accounts
router.post('/accounts/:id/transfer', walletController.transferFunds);

// Withdraw funds from an account
router.post('/accounts/:id/withdraw', walletController.withdrawFunds);

// Get account balance
router.post('/accounts/:id/balance', walletController.getAccountBalance);

export default router;