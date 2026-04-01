export const CREATE_TABLE_MIGRATION_TEMPLATE = `'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('{{table}}', {
{{columns}}
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('{{table}}');
  },
};`;
