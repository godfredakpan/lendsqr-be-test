import { Request, Response } from 'express';
import knex  from '../config/db';

// Create an account
export const createAccount = (req: Request, res: Response) => {
  const { id } = req.body;

  knex('user_accounts')
    .where({ id })
    .first()
    .then((account: any) => {
      if (account) {
        return res.status(400).json({ error: 'Account already exists' });
      }

      knex('user_accounts')
        .insert({ id, balance: 0 })
        .then(() => {
          return res.status(201).json({ message: 'Account created successfully' });
        })
        .catch(() => {
          return res.status(500).json({ error: 'Failed to create account' });
        });
    })
    .catch(() => {
      return res.status(500).json({ error: 'Internal server error' });
    });
};

// Fund an account
export const fundAccount = (req: Request, res: Response) => {
  const { id } = req.params;
  const { amount } = req.body;

  knex('user_accounts')
    .where({ id })
    .increment('balance', amount)
    .then(() => {
      return res.json({ message: 'Account funded successfully' });
    })
    .catch(() => {
      return res.status(500).json({ error: 'Failed to fund account' });
    });
};

// Transfer funds between accounts
export const transferFunds = (req: Request, res: Response) => {
  const { id } = req.params;
  const { recipientId, amount } = req.body;

  knex.transaction((trx: any) => {
    return trx('user_accounts')
      .where({ id })
      .decrement('balance', amount)
      .then(() => {
        return trx('user_accounts')
          .where({ id: recipientId })
          .increment('balance', amount);
      })
      .then(trx.commit)
      .catch(trx.rollback);
  })
    .then(() => {
      return res.json({ message: 'Funds transferred successfully' });
    })
    .catch(() => {
      return res.status(500).json({ error: 'Failed to transfer funds' });
    });
};

// Withdraw funds from an account
export const withdrawFunds = (req: Request, res: Response) => {
  const { id } = req.params;
  const { amount } = req.body;

  knex('user_accounts')
    .where({ id })
    .decrement('balance', amount)
    .then(() => {
      return res.json({ message: 'Funds withdrawn successfully' });
    })
    .catch(() => {
      return res.status(500).json({ error: 'Failed to withdraw funds' });
    });
};
