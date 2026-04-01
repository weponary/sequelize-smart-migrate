export const DROP_TABLE_MIGRATION_TEMPLATE = `'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.dropTable('{{table}}');
  },

  async down() {
    throw new Error('Cannot automatically revert dropTable for {{table}}. Recreate the table manually.');
  },
};`;
