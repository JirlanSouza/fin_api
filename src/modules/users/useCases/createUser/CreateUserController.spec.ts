import request from "supertest";
import { Connection, createConnection } from "typeorm";

import { app } from "../../../../app";

describe("Create user controller", () => {
  let connection: Connection;

  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.query(`DELETE FROM USERS`);
    await connection.close();
  });

  it("Should be able create a new user", async () => {
    await connection.query(`DELETE FROM USERS`);

    const userData = {
      name: "new user",
      email: "newuser@finapi.com",
      password: "newuser",
    };

    const response = await request(app).post("/api/v1/users").send(userData);

    expect(response.status).toBe(201);
  });

  it("Should not be able create a new user if user already exists", async () => {
    const userData = {
      name: "existent user",
      email: "existentser@finapi.com",
      password: "existentuser",
    };

    await request(app).post("/api/v1/users").send(userData);

    const response = await request(app).post("/api/v1/users").send(userData);

    expect(response.status).toBe(400);
  });
});
