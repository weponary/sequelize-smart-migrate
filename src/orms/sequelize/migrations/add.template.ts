export const ADD_MIGRATION_TEMPLATE = `'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('{{table}}', '{{column}}', {
      type: {{sequelizeType}},
      allowNull: true,
    });
  },
  async down(queryInterface) {
    await queryInterface.removeColumn('{{table}}', '{{column}}');
  },
};`;
