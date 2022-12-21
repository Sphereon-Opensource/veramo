import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm'
import Debug from 'debug'

const debug = Debug('veramo:data-store:simplify-relations-1447159020002')

/**
 * Fix inconsistencies between Entity data and column data.
 *
 * @public
 */
export class SimplifyRelations1447159020002 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    debug(`SimplifyRelations1447159020002 is patched. Nothing should run.`)
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    throw new Error('illegal_operation: cannot roll back initial migration')
  }
}
