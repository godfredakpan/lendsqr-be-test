import { Request, Response } from 'express';
import knex from '../config/db';
import bcrypt from 'bcrypt';
import { Account } from '../interface/account.interface';
import { createErrorResponse, createSuccessResponse } from '../helper/response';


export const createAccount = async (req: Request, res: Response) => {
  const { id, pin } = req.body;

  if (!id) return createErrorResponse(res,'Missing required parameter: id', 400);

  if (!pin) return createErrorResponse(res,'Missing required parameter: pin', 400);

  const hashedPin = await setTransactionPin(pin, id);

  knex('user_accounts')
    .where({ id })
    .first()
    .then((account: Account) => {
      if (account) {
        return createErrorResponse(res,'Account already exists', 400);
      }

      knex('user_accounts')
        .insert({ id, balance: 0, pin:hashedPin })
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
  .then(async (account: Account) => {
    if (!account) {
      return createErrorResponse(res,'User does not exist', 400);
    }

    if (await checkPin(pin, account.pin) === false) {
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

  knex('user_accounts')
  .where({ id: recipientId })
  .first()
  .then((account: Account) => {
    if (!account) {
      return createErrorResponse(res,'Recipient account does not exist', 400);
    }
  })

  knex.transaction((trx: any) => {
  return trx('user_accounts')
    .where({ id })
    .first()
    .then(async (account: Account | undefined) => {
      if (!account) {
        return createErrorResponse(res,'User does not exist', 400);
      }

      if (await checkPin(pin, account.pin) === false) {
        return createErrorResponse(res,'Invalid pin', 400);
      }
     
      if (account.balance < amount) {
        return createErrorResponse(res,'Insufficient funds', 400);
      }

      return trx('user_accounts')
        .where({ id })
        .decrement('balance', amount)
        .then(() => {
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
  .then(async (account: Account) => {
    if (!account) {
      return createErrorResponse(res,'User does not exist', 400);
    }

    if (await checkPin(pin, account.pin) === false) {
      return createErrorResponse(res,'Invalid pin', 400);
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
  const { id } = req.params;
  const { pin } = req.body;

  if (!pin) {
    return createErrorResponse(res,'Missing required parameter: pin', 400);
  }

  if (!id) {
    return createErrorResponse(res,'Missing required parameter: id', 400);
  }

  knex('user_accounts')
  .where({ id })
  .first()
  .then(async(account: Account) => {
    if (!account) {
      return createErrorResponse(res,'User does not exist', 400);
    }

    if (await checkPin(pin, account.pin) === false) {
      return createErrorResponse(res,'Invalid pin', 400);
    }

    return createSuccessResponse(res,`Your account balance is ${account.balance}`);


  })
  .catch((error: any) => {
    return createErrorResponse(res,error.message || 'Internal server error', 500);
  });

}

export const setTransactionPin = async (pin: number|string, id:number) => {

  const saltRounds = 10;

  const pinString = pin.toString();

  const salt = await bcrypt.genSalt(saltRounds);

  const hashedPIN = await bcrypt.hash(pinString, salt);

  return hashedPIN;

}

const checkPin = async (pin: string, hashedPin: string) => {
  const checkPin = await bcrypt.compare(pin, hashedPin);
  return checkPin;
}
