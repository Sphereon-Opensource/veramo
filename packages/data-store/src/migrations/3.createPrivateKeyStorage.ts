import { MigrationInterface, QueryRunner, Table, TableColumn } from 'typeorm'
import { PrivateKey } from '..'
import { PreMigrationKey } from '../entities/PreMigrationEntities'
import Debug from 'debug'
const debug = Debug('veramo:data-store:migrate-private-keys')

/**
 * Migration of existing private keys from Veramo 2.x to Veramo 3.x
 *
 * @public
 */
export class CreatePrivateKeyStorage1629293428674 implements MigrationInterface {
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
    // 1.create new table
    debug(`creating new private-key table`)
    await queryRunner.createTable(
      new Table({
        name: getTable('private-key').name,
        columns: [
          {
            name: 'alias',
            type: 'varchar',
            isPrimary: true,
          },
          {
            name: 'type',
            type: 'varchar',
          },
          {
            name: 'privateKeyHex',
            type: 'varchar',
          },
        ],
      }),
      true,
    )
    // 2. copy key data
    const keys: PreMigrationKey[] = await queryRunner.manager.query(`SELECT * FROM `+getTableName('key'));

    debug(`got ${keys.length} potential keys to migrate`)
    const privKeys = keys
      .filter((key) => typeof key.privateKeyHex !== 'undefined' && key.privateKeyHex !== null)
      .map((key) => ({
        alias: key.kid,
        type: key.type,
        privateKeyHex: key.privateKeyHex,
      }))
    debug(`${privKeys.length} keys need to be migrated`)
    await queryRunner.manager
      .createQueryBuilder()
      .insert()
      .into(getTable('private-key').name)
      .values(privKeys)
      .execute()
    // 3. drop old column
    debug(`dropping privKeyHex column from old key table`)

    await queryRunner.startTransaction();

    await queryRunner.createTable(
        new Table({
          name: getTableName('key_backup'),
          columns: [
            { name: 'kid', type: 'varchar', isPrimary: true },
            { name: 'kms', type: 'varchar' },
            { name: 'type', type: 'varchar' },
            { name: 'publicKeyHex', type: 'varchar' },
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
    await queryRunner.manager.query('INSERT INTO '+getTableName('key_backup')+' SELECT kid, kms, type, publicKeyHex, meta, identifierDid FROM '+getTableName('key')+';');
    await queryRunner.manager.query('DROP TABLE '+getTableName('key')+';');
    await queryRunner.createTable(
        new Table({
          name: getTableName('key'),
          columns: [
            { name: 'kid', type: 'varchar', isPrimary: true },
            { name: 'kms', type: 'varchar' },
            { name: 'type', type: 'varchar' },
            { name: 'publicKeyHex', type: 'varchar' },
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

    //4. done
    debug(`migrated ${privKeys.length} keys to private key storage`)
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    function getTableName(givenName: string): string {
      return (
        queryRunner.connection.entityMetadatas.find((meta) => meta.givenTableName === givenName)?.tableName ||
        givenName
      )
    }
    // 1. add old column back
    debug(`adding back privateKeyHex column to key table`)
    await queryRunner.addColumn(
      'key',
      new TableColumn({
        name: 'privateKeyHex',
        type: 'varchar',
        isNullable: true,
      }),
    )
    // 2. copy key data
    debug(`checking keys to be rolled back`)
    const keys: PrivateKey[] = await queryRunner.manager.find(PrivateKey)
    debug(`copying ${keys.length} keys`)
    for (const key of keys) {
      await queryRunner.manager
        .createQueryBuilder()
        .update(PreMigrationKey)
        .set({ privateKeyHex: key.privateKeyHex })
        .where('kid = :alias', { alias: key.alias })
        .execute()
    }
    debug(`dropping private-key table`)
    // 3. drop the new private key table
    await queryRunner.dropTable(getTableName('private-key'))
    // 4. done
    debug(`rolled back ${keys.length} keys`)
  }
}
