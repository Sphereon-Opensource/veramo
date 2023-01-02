import { MigrationInterface, QueryRunner, Table, TableColumn } from 'typeorm'
import Debug from 'debug'

/**
 * Fix inconsistencies between Entity data and column data.
 *
 * @public
 */
export class SimplifyRelations1447159020002 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    function getTable(givenName: string): Table {
      const entityMetadatas = queryRunner.connection.entityMetadatas.find((meta) => meta.givenTableName === givenName);
      return Table.create(entityMetadatas!, queryRunner.connection.driver);
    }
    await queryRunner.changeColumn(
      getTable('key'),
      'identifierDid',
      new TableColumn({ name: 'identifierDid', type: 'varchar', isNullable: true }),
    )
    await queryRunner.changeColumn(
        getTable('service'),
      'identifierDid',
      new TableColumn({ name: 'identifierDid', type: 'varchar', isNullable: true }),
    )
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    throw new Error('illegal_operation: cannot roll back initial migration')
  }
}
