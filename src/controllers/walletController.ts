import { Request, Response } from 'express';
import knex from '../config/db';
import bcrypt from 'bcrypt';
import { Account } from '../interface/account.interface';
import { createErrorResponse, createSuccessResponse } from '../helper/response';
import { UserAccountModel } from '../models/userAccount';


// Create an account
export const createAccount = async (req: Request, res: Response) => {
  const { id, pin } = req.body;

  if (!id) return createErrorResponse(res,'Missing required parameter: id', 400);

  if (!pin) return createErrorResponse(res,'Missing required parameter: pin', 400);

  knex('user_accounts')
    .where({ id })
    .first()
    .then((account: Account) => {
      if (account) {
        return createErrorResponse(res,'Account already exists', 400);
      }

      if (!UserAccountModel.comparePin(pin, account.pin)) {
        return createErrorResponse(res,'Invalid pin', 400);
      }

      knex('user_accounts')
        .insert({ id, balance: 0, pin })
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
  const { amount, pin } = req.body;
  
  if (!pin) {
    return createErrorResponse(res,'Missing required parameter: pin', 400);
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

  knex('user_accounts')
  .where({ id })
  .first()
  .then((account: Account) => {
    if (!account) {
      return createErrorResponse(res,'User does not exist', 400);
    }

    if (!UserAccountModel.comparePin(pin, account.pin)) {
      return createErrorResponse(res,'Invalid pin', 400);
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
  const { recipientId, amount, pin } = req.body;

  if (!pin) {
    return createErrorResponse(res,'Missing required parameter: pin', 400);
  }

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

      if (!UserAccountModel.comparePin(pin, account.pin)) {
        return createErrorResponse(res,'Invalid pin', 400);
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
  const { amount, pin } = req.body;

  if (!pin) {
    return createErrorResponse(res,'Missing required parameter: pin', 400);
  }

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

export const getAccountBalance = async (req: Request, res: Response) => {
  const { id, pin } = req.params;

  if (!pin) {
    return createErrorResponse(res,'Missing required parameter: pin', 400);
  }

  if (!id) {
    return createErrorResponse(res,'Missing required parameter: id', 400);
  }

  knex('user_accounts')
  .where({ id })
  .first()
  .then((account: Account) => {
    if (!account) {
      return createErrorResponse(res,'User does not exist', 400);
    }

    if (!UserAccountModel.comparePin(pin, account.pin)) {
      return createErrorResponse(res,'Invalid pin', 400);
    }

    return createSuccessResponse(res,`Your account balance is ${account.balance}`);
  })
  .catch((error: any) => {
    return createErrorResponse(res,error.message || 'Internal server error', 500);
  });

}

export const setTransactionPin = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { pin } = req.body;

  if (!id) {
    return createErrorResponse(res,'Missing required parameter: id', 400);
  }

  if (!pin) {
    return createErrorResponse(res,'Missing required parameter: pin', 400);
  }

  if (typeof pin !== 'number') {
    return createErrorResponse(res,'Pin must be a number', 400);
  }

  const saltRounds = 10;

  const pinString = pin.toString();

  const salt = await bcrypt.genSalt(saltRounds);

  const hashedPIN = await bcrypt.hash(pinString, salt);

  knex('user_accounts')
  .where({ id })
  .first()
  .then((account: Account) => {
    if (!account) {
      return createErrorResponse(res,'User does not exist', 400);
    }

    knex('user_accounts')
    .where({ id })
    .update({ pin: hashedPIN })
    .then(() => {
      return createSuccessResponse(res,'Pin set successfully');
    })
    .catch(() => {
      return createErrorResponse(res,'Failed to set pin', 500);
    });
  }
  )
  .catch((error: any) => {
    return createErrorResponse(res,error.message || 'Internal server error', 500);
  }
  );

}
