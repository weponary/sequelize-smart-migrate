export const REMOVE_INDEX_MIGRATION_TEMPLATE = `'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.removeIndex('{{table}}', '{{indexName}}');
  },

  async down(queryInterface) {
    await queryInterface.addIndex('{{table}}', ['{{column}}'], {
      name: '{{indexName}}',
    });
  },
};`;
