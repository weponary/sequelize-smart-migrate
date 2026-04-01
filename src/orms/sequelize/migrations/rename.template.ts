export const RENAME_MIGRATION_TEMPLATE = `'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.renameColumn('{{table}}', '{{oldCol}}', '{{newCol}}');
  },
  async down(queryInterface) {
    await queryInterface.renameColumn('{{table}}', '{{newCol}}', '{{oldCol}}');
  },
};`;
