export const CHANGE_COLUMN_MIGRATION_TEMPLATE = `'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('{{table}}', '{{column}}', {
      type: {{sequelizeType}},
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('{{table}}', '{{column}}', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },
};`;
