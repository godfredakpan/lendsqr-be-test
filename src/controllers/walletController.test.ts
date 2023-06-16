import { expect } from 'chai';
import { createAccount, fundAccount, transferFunds, withdrawFunds } from './walletController';
import { Request, Response } from 'express';
import sinon from 'sinon';

describe('Wallet Controller', () => {
  afterEach(() => {
    sinon.restore();
  });
  
  describe('createAccount', () => {
    it('should create an account successfully', async () => {
      const req = {
        body: {
          id: 'yourAccountId',
        },
      } as Request;

      const res = {
        status: (code: number) => ({
          json: (data: any) => {
            expect(code).to.equal(201);
            expect(data.message).to.equal('Account created successfully');
          },
        }),
      } as Response;

      await createAccount(req, res);
    });

    it('should return an error if id parameter is missing', async () => {
      const req = {
        body: {},
      } as Request;

      const res = {
        status: (code: number) => ({
          json: (data: any) => {
            expect(code).to.equal(400);
            expect(data.error).to.equal('Missing required parameter: id');
          },
        }),
      } as Response;

      await createAccount(req, res);
    });
  });

  describe('fundAccount', () => {
    it('should return an error if account does not exist', async () => {
      const req = {
        params: {
          id: 'yourAccountId',
        },
        body: {
          amount: 100,
        },
      } as unknown as Request;

      const res = {
        status: (code: number) => ({
          json: (data: any) => {
            expect(code).to.equal(404);
            expect(data.error).to.equal('User not found');
          },
        }),
      } as Response;

      await fundAccount(req, res);
    });


    it('should fund an account successfully', async () => {
      const req = {
        params: {
          id: 'yourAccountId',
        },
        body: {
          amount: 100,
        },
      } as unknown as Request;
      

      const res = {
        status: (code: number) => ({
          json: (data: any) => {
            expect(code).to.equal(201);
            expect(data.message).to.equal('Account funded successfully');
          },
        }),
      } as Response;

      await fundAccount(req, res);
    });

    it('should return an error if id parameter is missing', async () => {
      const req = {
        body: {},
        params: { id: null },
      } as unknown as Request;

      const res = {
        status: (code: number) => ({
          json: (data: any) => {
            expect(code).to.equal(400);
            expect(data.error).to.equal('Missing required parameter: id');
          },
        }),
      } as Response;

      await fundAccount(req, res);
    }
    );

    it('should return an error if amount parameter is missing', async () => {
      const req = {
        body: { amount: null },
        params: { id: 'yourAccountId' },
      } as unknown as Request;

      const res = {
        status: (code: number) => ({
          json: (data: any) => {
            expect(code).to.equal(400);
            expect(data.error).to.equal('Missing required parameter: amount');
          },
        }),
      } as Response;

      await fundAccount(req, res);
    }
    );

    it('should return an error if amount parameter is not a number', async () => {
      const req = {
        body: { amount: 'notANumber', recipientId: 'recipientId' },
        params: { id: 'yourAccountId' },
      } as unknown as Request;

      const res = {
        status: (code: number) => ({
          json: (data: any) => {
            expect(code).to.equal(400);
            expect(data.error).to.equal('Amount must be a number');
          },
        }),
      } as Response;

      await fundAccount(req, res);
    });

  });

  describe('transferFunds', () => {
    it('should return an error if account does not exist', async () => {
      const req = {
        params: {
          id: 'yourAccountId',
        },
        body: {
          amount: 100,
          recipientId: 'recipientId'
        },
      } as unknown as Request;

      const res = {
        status: (code: number) => ({
          json: (data: any) => {
            expect(code).to.equal(400);
            expect(data.error).to.equal('User not found');
          },
        }),
      } as Response;

      await transferFunds(req, res);
    });

    it('should return an error if account does not have sufficient funds', async () => {
      const req = {
        params: {
          id: 'yourAccountId',
        },
        body: {
          amount: 100,
          recipientId: 'recipientId'
        },
      } as unknown as Request;

      const res = {
        status: (code: number) => ({
          json: (data: any) => {
            expect(code).to.equal(400);
            expect(data.error).to.equal('Insufficient funds');
          },
        }),
      } as Response;

      await transferFunds(req, res);
    });

    // cant transfer to self
    it('should return an error if recipientId is the same as the sender', async () => {
      const req = {
        params: {
          id: 'yourAccountId',
        },
        body: {
          amount: 100,
          recipientId: 'recipientId'
        },
      } as unknown as Request;
      
      const res = {
        status: (code: number) => ({
          json: (data: any) => {
            expect(code).to.equal(400);
            expect(data.error).to.equal('Cannot transfer funds to self');
          },
        }),
      } as Response;

      await transferFunds(req, res);
    });


    it('should transfer funds successfully', async () => {
      const req = {
        params: {
          id: 'yourAccountId',
        },
        body: {
          amount: 100,
          recipientId: 'recipientId'
        },
      } as unknown as Request;
      

      const res = {
        status: (code: number) => ({
          json: (data: any) => {
            expect(code).to.equal(201);
            expect(data.message).to.equal('Account funded successfully');
          },
        }),
      } as Response;

      await transferFunds(req, res);
    });

    it('should return an error if id parameter is missing', async () => {
      const req = {
        body: {
          amount: 100,
          recipientId: 'recipientId'
        },
        params: { id: null },
      } as unknown as Request;

      const res = {
        status: (code: number) => ({
          json: (data: any) => {
            expect(code).to.equal(400);
            expect(data.error).to.equal('Missing required parameter: id');
          },
        }),
      } as Response;

      await transferFunds(req, res);
    });

    it('should return an error if amount parameter is missing', async () => {
      const req = {
        body: { amount: null, recipientId: 'recipientId' },
        params: { id: 'yourAccountId' },
      } as unknown as Request;

      const res = {
        status: (code: number) => ({
          json: (data: any) => {
            expect(code).to.equal(400);
            expect(data.error).to.equal('Missing required parameter: amount');
          },
        }),
      } as Response;

      await transferFunds(req, res);
    });


    it('should return an error if recipientId parameter is not present', async () => {
      const req = {
        body: { amount: 200, recipientId: null },
        params: { id: 'yourAccountId', },
      } as unknown as Request;

      const res = {
        status: (code: number) => ({
          json: (data: any) => {
            expect(code).to.equal(400);
            expect(data.error).to.equal('Missing required parameter: recipientId');
          },
        }),
      } as Response;

      await transferFunds(req, res);
    });


    it('should return an error if amount parameter is not a number', async () => {
      const req = {
        body: { amount: 'notANumber', recipientId: 'recipientId' },
        params: { id: 'yourAccountId' },
      } as unknown as Request;

      const res = {
        status: (code: number) => ({
          json: (data: any) => {
            expect(code).to.equal(400);
            expect(data.error).to.equal('Amount must be a number');
          },
        }),
      } as Response;

      await transferFunds(req, res);
    });


  });

  describe('withdrawFunds', () => {
    // check if account has sufficient funds
    it('should return an error if account does not have sufficient funds', async () => {
      const req = {
        params: {
          id: 'yourAccountId',
        },
        body: {
          amount: 100,
        },
      } as unknown as Request;

      const res = {
        status: (code: number) => ({
          json: (data: any) => {
            console.log(data);
            expect(code).to.equal(400);
            expect(data.error).to.equal('Insufficient funds');
          },
        }),
      } as Response;

      await withdrawFunds(req, res);
    });


    it('should withdraw funds successfully', async () => {
      const req = {
        params: {
          id: 'yourAccountId',
        },
        body: {
          amount: 100,
        },
      } as unknown as Request;
      

      const res = {
        status: (code: number) => ({
          json: (data: any) => {
            expect(code).to.equal(201);
            expect(data.message).to.equal('Account funded successfully');
          },
        }),
      } as Response;

      await withdrawFunds(req, res);
    });

    it('should return an error if id parameter is missing', async () => {
      const req = {
        body: {
          amount: 100,
        },
        params: { id: null },
      } as unknown as Request;

      const res = {
        status: (code: number) => ({
          json: (data: any) => {
            expect(code).to.equal(400);
            expect(data.error).to.equal('Missing required parameter: id');
          },
        }),
      } as Response;

      await withdrawFunds(req, res);
    });

    it('should return an error if amount parameter is missing', async () => {
      const req = {
        body: { amount: null },
        params: { id: 'yourAccountId' },
      } as unknown as Request;

      const res = {
        status: (code: number) => ({
          json: (data: any) => {
            expect(code).to.equal(400);
            expect(data.error).to.equal('Missing required parameter: amount');
          },
        }),
      } as Response;

      await withdrawFunds(req, res);
    });


    it('should return an error if amount parameter is not a number', async () => {
      const req = {
        body: { amount: 'notANumber' },
        params: { id: 'yourAccountId' },
      } as unknown as Request;

      const res = {
        status: (code: number) => ({
          json: (data: any) => {
            expect(code).to.equal(400);
            expect(data.error).to.equal('Amount must be a number');
          },
        }),
      } as Response;

      await withdrawFunds(req, res);
    });
  });
});

