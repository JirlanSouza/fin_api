import request from "supertest";
import { Connection, createConnection, getConnection } from "typeorm";

import { app } from "../../../../app";

describe("Create user controller", () => {
  let connection: Connection;

  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("Should be able create a new user", async () => {
    const userData = {
      name: "new user",
      email: "newuser@finapi.com",
      password: "newuser",
    };

    const response = await request(app).post("/api/v1/users").send(userData);

    console.log(response.body);

    expect(response.status).toBe(201);
  });

  it("Should not be able create a new user if user already exists", async () => {
    const userData = {
      name: "new user",
      email: "newuser@finapi.com",
      password: "newuser",
    };

    await request(app).post("/api/v1/users").send(userData);

    const response = await request(app).post("/api/v1/users").send(userData);

    expect(response.status).toBe(400);
  });
});
