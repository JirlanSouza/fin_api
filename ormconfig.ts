let ormConfig;

if (process.env.NODE_ENV === "development") {
  ormConfig = {
    username: "postgres",
    password: "docker",
    name: "default",
    type: "postgres",
    host: "localhost",
    port: 5432,
    database: "fin_api_test",
    dropSchema: true,
    synchronize: true,
    migrationRun: true,
    entities: ["./src/modules/**/entities/*.ts"],
    migrations: ["./src/database/migrations/*.ts"],
    cli: {
      migrationsDir: "./src/database/migrations",
    },
  };
} else {
  ormConfig = {
    username: "postgres",
    password: "docker",
    name: "default",
    type: "postgres",
    host: "localhost",
    port: 5432,
    database: "fin_api",
    entities: ["./src/modules/**/entities/*.ts"],
    migrations: ["./src/database/migrations/*.ts"],
    cli: {
      migrationsDir: "./src/database/migrations",
    },
  };
}

export default ormConfig;
