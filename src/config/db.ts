import knex from 'knex';

const db = knex({
  client: 'mysql2',
  connection: {
    host: 'localhost',
    user: 'lend_test_username',
    password: 'lend_test_password',
    database: 'lend_test_database',
  },
});

export default db;
