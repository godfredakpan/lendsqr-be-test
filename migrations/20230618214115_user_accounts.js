
exports.up = function(knex) {
    return knex.schema.createTable('user_accounts', table => {
        table.increments('id');
        table.string('balance').defaultTo(0);
        table.string('pin').notNullable();
        table.timestamps(true, true);
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('user_accounts');
};
