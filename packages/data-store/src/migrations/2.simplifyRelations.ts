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
    function getTableName(givenName: string): string {
      return (
          queryRunner.connection.entityMetadatas.find((meta) => meta.givenTableName === givenName)?.tableName ||
          givenName
      )
    }

    await queryRunner.startTransaction();

    await queryRunner.createTable(
        new Table({
          name: getTableName('key_backup'),
          columns: [
            { name: 'kid', type: 'varchar', isPrimary: true },
            { name: 'kms', type: 'varchar' },
            { name: 'type', type: 'varchar' },
            { name: 'publicKeyHex', type: 'varchar' },
            { name: 'privateKeyHex', type: 'varchar', isNullable: true },
            { name: 'meta', type: 'text', isNullable: true },
            { name: 'identifierDid', type: 'varchar' },
          ],
          foreignKeys: [
            {
              columnNames: ['identifierDid'],
              referencedColumnNames: ['did'],
              referencedTableName: getTableName('identifier'),
            },
          ],
        }),
        true,
    )
    await queryRunner.manager.query('INSERT INTO '+getTableName('key_backup')+' SELECT * FROM '+getTableName('key')+';');
    await queryRunner.manager.query('DROP TABLE '+getTableName('key')+';');
    await queryRunner.createTable(
        new Table({
          name: getTableName('key'),
          columns: [
            { name: 'kid', type: 'varchar', isPrimary: true },
            { name: 'kms', type: 'varchar' },
            { name: 'type', type: 'varchar' },
            { name: 'publicKeyHex', type: 'varchar' },
            { name: 'privateKeyHex', type: 'varchar', isNullable: true },
            { name: 'meta', type: 'text', isNullable: true },
            { name: 'identifierDid', type: 'varchar', isNullable: true },
          ],
          foreignKeys: [
            {
              columnNames: ['identifierDid'],
              referencedColumnNames: ['did'],
              referencedTableName: getTableName('identifier'),
            },
          ],
        }),
        true,
    )
    await queryRunner.manager.query('INSERT INTO '+getTableName('key')+' SELECT * FROM '+getTableName('key_backup')+';');
    await queryRunner.manager.query('DROP TABLE '+getTableName('key_backup')+';');
    await queryRunner.commitTransaction();

    await queryRunner.startTransaction();

    await queryRunner.createTable(
        new Table({
          name: getTableName('service_backup'),
          columns: [
            { name: 'id', type: 'varchar', isPrimary: true },
            { name: 'type', type: 'varchar' },
            { name: 'serviceEndpoint', type: 'varchar' },
            { name: 'description', type: 'varchar', isNullable: true },
            { name: 'identifierDid', type: 'varchar' },
          ],
          foreignKeys: [
            {
              columnNames: ['identifierDid'],
              referencedColumnNames: ['did'],
              referencedTableName: getTableName('identifier'),
              onDelete: 'cascade',
            },
          ],
        }),
        true,
    )
    await queryRunner.manager.query('INSERT INTO '+getTableName('service_backup')+' SELECT * FROM '+getTableName('service')+';');
    await queryRunner.manager.query('DROP TABLE '+getTableName('service')+';');
    await queryRunner.createTable(
        new Table({
          name: getTableName('service'),
          columns: [
            { name: 'id', type: 'varchar', isPrimary: true },
            { name: 'type', type: 'varchar' },
            { name: 'serviceEndpoint', type: 'varchar' },
            { name: 'description', type: 'varchar', isNullable: true },
            { name: 'identifierDid', type: 'varchar', isNullable: true  },
          ],
          foreignKeys: [
            {
              columnNames: ['identifierDid'],
              referencedColumnNames: ['did'],
              referencedTableName: getTableName('identifier'),
              onDelete: 'cascade',
            },
          ],
        }),
        true,
    )
    await queryRunner.manager.query('INSERT INTO '+getTableName('service')+' SELECT * FROM '+getTableName('service_backup')+';');
    await queryRunner.manager.query('DROP TABLE '+getTableName('service_backup')+';');
    await queryRunner.commitTransaction();


  }

  async down(queryRunner: QueryRunner): Promise<void> {
    throw new Error('illegal_operation: cannot roll back initial migration')
  }
}
