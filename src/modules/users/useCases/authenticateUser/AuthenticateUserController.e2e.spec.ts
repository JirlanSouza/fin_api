import { hash } from "bcryptjs";
import request from "supertest";
import { v4 as uuidV4 } from "uuid";

import { app } from "../../../../app";
import { DbConnection } from "../../../../database";

describe("Authenticate user controller", () => {
  beforeAll(async () => {
    await DbConnection.create();
  });

  afterEach(async () => {
    await DbConnection.clear();
  });

  afterAll(async () => {
    await DbConnection.close();
  });

  async function createUser() {
    const passwordHash = await hash("newuser", 8);

    await DbConnection.connection
      .query(`INSERT INTO USERS(id, name, email, password)
      values('${uuidV4()}', 'new user', 'newuser@finapi.com', '${passwordHash}')
    `);
  }

  it("Should be able authenticate user", async () => {
    await createUser();

    const userData = {
      email: "newuser@finapi.com",
      password: "newuser",
    };

    const response = await request(app).post("/api/v1/sessions").send(userData);

    expect(response.status).toBe(200);
  });

  it("Should not be able authenticate user  if email is incorrect", async () => {
    await createUser();

    const userData = {
      email: "incorrecteuseremail@finapi.com",
      password: "newuser",
    };

    const response = await request(app).post("/api/v1/sessions").send(userData);

    expect(response.status).toBe(401);
  });

  it("Should not be able authenticate user  if password is incorrect", async () => {
    await createUser();

    const userData = {
      email: "newuser@finapi.com",
      password: "incorrectpassword",
    };

    const response = await request(app).post("/api/v1/sessions").send(userData);

    expect(response.status).toBe(401);
  });
});
