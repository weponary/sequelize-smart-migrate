export const REMOVE_MIGRATION_TEMPLATE = `'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.removeColumn('{{table}}', '{{column}}');
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn('{{table}}', '{{column}}', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },
};`;
