import { Request, Response } from 'express';
import knex from '../config/db';
import { Account } from '../interface/account.interface';
import { createErrorResponse, createSuccessResponse } from '../helper/response';


// Create an account
export const createAccount = async (req: Request, res: Response) => {
  const { id } = req.body;

  if (!id) return createErrorResponse(res,'Missing required parameter: id', 400);

  knex('user_accounts')
    .where({ id })
    .first()
    .then((account: Account) => {
      if (account) {
        return createErrorResponse(res,'Account already exists', 400);
      }

      knex('user_accounts')
        .insert({ id, balance: 0 })
        .then(() => {
          return createSuccessResponse(res,'Account created successfully');
        })
        .catch(() => {
          return createErrorResponse(res,'Failed to create account', 500);
        });
    })
    .catch((error: any) => {
      return createErrorResponse(res,'Internal server error', 500);
    });
};

// Fund an account
export const fundAccount = async (req: Request, res: Response) => {
  const { id } = req?.params;
  const { amount } = req.body;

  if (!id) {
    return createErrorResponse(res,'Missing required parameter: id', 400);
  }

  if (!amount) {
    return createErrorResponse(res,'Missing required parameter: amount', 400);
  }

  if (typeof amount !== 'number') {
    return createErrorResponse(res,'Amount must be a number', 400);
  }

  knex('user_accounts')
  .where({ id })
  .first()
  .then((account: Account) => {
    if (!account) {
      return createErrorResponse(res,'User does not exist', 400);
    }

    knex('user_accounts')
      .where({ id })
      .increment('balance', amount)
      .then(() => {
        return createSuccessResponse(res,'Account funded successfully');
      })
      .catch(() => {
        return createErrorResponse(res,'Failed to fund account', 500);
      });
  })
  .catch((error: any) => {
    return createErrorResponse(res,error.message || 'Internal server error', 500);
  });

};

// Transfer funds between accounts
export const transferFunds = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { recipientId, amount } = req.body;

  if (!recipientId) {
    return createErrorResponse(res,'Missing required parameter: recipientId', 400);
  }

  if (!id) {
    return createErrorResponse(res,'Missing required parameter: id', 400);
  }

  if (!amount) {
    return createErrorResponse(res,'Missing required parameter: amount', 400);
  }

  if (typeof amount !== 'number') {
    return createErrorResponse(res,'Amount must be a number', 400);
  }

  if (Number(id) === Number(recipientId)) {
    return createErrorResponse(res,'You cannot transfer funds to yourself', 400);
  }

  knex.transaction((trx: any) => {
  return trx('user_accounts')
    .where({ id })
    .first()
    .then((account: Account | undefined) => {
      if (!account) {
        return createErrorResponse(res,'User does not exist', 400);
      }

      if (account.balance < amount) {
        return createErrorResponse(res,'Insufficient funds', 400);
      }

      // Decrement balance from sender's account
      return trx('user_accounts')
        .where({ id })
        .decrement('balance', amount)
        .then(() => {
          // Increment balance to recipient's account
          return trx('user_accounts')
            .where({ id: recipientId })
            .increment('balance', amount);
        });
    })
    .then(trx.commit)
    .catch(trx.rollback);
})
  .then(() => {
    return createSuccessResponse(res,'Funds transferred successfully');
  })
  .catch(() => {
    return createErrorResponse(res,'Failed to transfer funds', 500);
  });

};

// Withdraw funds from an account
export const withdrawFunds = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { amount } = req.body;

  if (!amount) {
    return createErrorResponse(res,'Missing required parameter: amount', 400);
  }

  if (amount < 0) {
    return createErrorResponse(res,'Amount must be greater than 0', 400);
  }

  knex('user_accounts')
  .where({ id })
  .first()
  .then((account: Account) => {
    if (!account) {
      return createErrorResponse(res,'User does not exist', 400);
    }

    if (account.balance < amount) {
      return createErrorResponse(res,'Insufficient funds', 400);
    }

  knex('user_accounts')
    .where({ id })
    .decrement('balance', amount)
    .then(() => {
      return createSuccessResponse(res,'Funds withdrawn successfully');
    })
    .catch(() => {
      return createErrorResponse(res,'Failed to withdraw funds', 500);
    });
  })
};
