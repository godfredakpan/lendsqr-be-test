import knex  from '../config/db';

interface UserAccount {
  id: string;
  balance: number;
}

export const UserAccountModel = {
  async create(userAccount: UserAccount): Promise<void> {
    await knex('user_accounts').insert(userAccount);
  },

  async findById(id: string): Promise<UserAccount | null> {
    return knex('user_accounts').where({ id }).first();
  },

  async updateBalance(id: string, newBalance: number): Promise<void> {
    await knex('user_accounts').where({ id }).update({ balance: newBalance });
  },
};
