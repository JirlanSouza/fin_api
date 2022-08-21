import request from "supertest";

import { app } from "../../../../app";
import { DbConnection } from "../../../../database";

describe("Create user controller", () => {
  beforeAll(async () => {
    await DbConnection.create();
  });

  afterEach(async () => {
    await DbConnection.clear();
  });

  afterAll(async () => {
    await DbConnection.close();
  });

  it("Should be able create a new user", async () => {
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
