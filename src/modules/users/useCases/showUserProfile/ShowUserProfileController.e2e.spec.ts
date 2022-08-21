import { hash } from "bcryptjs";
import request from "supertest";
import { v4 as uuidV4 } from "uuid";

import { app } from "../../../../app";
import { DbConnection } from "../../../../database";

describe("Show user profile controller", () => {
  let userId = uuidV4();
  const userData = {
    email: "newuser@finapi.com",
    password: "newuser",
  };

  beforeAll(async () => {
    await DbConnection.create();
  });

  beforeEach(async () => {
    await DbConnection.clear();
  });

  afterAll(async () => {
    await DbConnection.close();
  });

  it("Should be able show user profile", async () => {
    const passwordHash = await hash(userData.password, 8);

    await DbConnection.connection
      .query(`INSERT INTO USERS(id, name, email, password)
      values('${userId}', 'new user', '${userData.email}', '${passwordHash}')
    `);

    const authenticateResponse = await request(app)
      .post("/api/v1/sessions")
      .send(userData);
    const { token } = authenticateResponse.body;

    const response = await request(app)
      .get("/api/v1/profile")
      .set("authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("id");
  });

  it("Should not be able show user profile if users does not authenticated", async () => {
    const response = await request(app)
      .get("/api/v1/profile")
      .set("authorization", `Bearer token_invalid`);

    expect(response.status).toBe(401);
  });
});
