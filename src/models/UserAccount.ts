import knex  from '../config/db';
import { Account } from '../interface/account.interface';


export const UserAccountModel = {
  async create(userAccount: Account): Promise<void> {
    await knex('user_accounts').insert(userAccount);
  },

  async findById(id: string): Promise<Account | null> {
    return knex('user_accounts').where({ id }).first();
  },

  async updateBalance(id: string, newBalance: number): Promise<void> {
    await knex('user_accounts').where({ id }).update({ balance: newBalance });
  },
};
