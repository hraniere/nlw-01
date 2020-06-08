import Knex from 'knex'

export async function up(knex: Knex) {
  return knex.schema.createTable('facility_categories', table => {
    table.increments('id').primary()
    table.integer('facility_id').notNullable().references('id').inTable('facilities')
    table.integer('category_id').notNullable().references('id').inTable('categories')
  })
}

export async function down(knex: Knex) {
  return knex.schema.dropTable('facility_categories')
}