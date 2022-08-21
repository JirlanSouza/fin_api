import { Connection as TypeormConnection, createConnection, Db } from "typeorm";

export type Connection = TypeormConnection;

export class DbConnection {
  static connection: Connection;

  static async create() {
    DbConnection.connection = await createConnection();
    return DbConnection.connection;
  }

  static async close() {
    await DbConnection.connection?.close();
  }

  static async clear() {
    const entities = DbConnection.connection?.entityMetadatas;

    for (const entity of entities) {
      const repository = DbConnection.connection?.getRepository(entity.name);
      await repository.query(`DELETE FROM ${entity.tableName}`);
    }
  }
}
