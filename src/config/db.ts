// import knex from 'knex';


const db = require('knex')({
  client: 'mysql2',
  connection: {
    host: '127.0.0.1',
    user: 'root',
    password: 'megatron007',
    database: 'lendr',
  },
});

export default db;
