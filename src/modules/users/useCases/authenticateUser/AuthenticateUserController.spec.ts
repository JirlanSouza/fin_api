import { hash } from "bcryptjs";
import request from "supertest";
import { Connection, createConnection } from "typeorm";
import { v4 as uuidV4 } from "uuid";

import { app } from "../../../../app";

describe("Authenticate user controller", () => {
  let connection: Connection;

  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    const passwordHash = await hash("newuser", 8);

    await connection.query(`INSERT INTO USERS(id, name, email, password)
      values('${uuidV4()}', 'new user', 'newuser@finapi.com', '${passwordHash}')
    `);
  });

  afterAll(async () => {
    connection.query(`DELETE FROM USERS`);
    await connection.close();
  });

  it("Should be able authenticate user", async () => {
    const userData = {
      email: "newuser@finapi.com",
      password: "newuser",
    };

    const response = await request(app).post("/api/v1/sessions").send(userData);

    expect(response.status).toBe(200);
  });

  it("Should not be able authenticate user  if email is incorrect", async () => {
    const userData = {
      email: "incorrecteuseremail@finapi.com",
      password: "newuser",
    };

    const response = await request(app).post("/api/v1/sessions").send(userData);

    expect(response.status).toBe(401);
  });

  it("Should not be able authenticate user  if password is incorrect", async () => {
    const userData = {
      email: "newuser@finapi.com",
      password: "incorrectpassword",
    };

    const response = await request(app).post("/api/v1/sessions").send(userData);

    expect(response.status).toBe(401);
  });
});
