import { hash } from "bcryptjs";
import request from "supertest";
import { v4 as uuidV4 } from "uuid";
import { app } from "../../../../app";
import { DbConnection } from "../../../../database";

describe("Get balance controller", () => {
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

    const passwordHash = await hash(userData.password, 8);
    await DbConnection.connection
      .query(`INSERT INTO USERS(id, name, email, password)
      values('${userId}', 'new user', '${userData.email}', '${passwordHash}')
    `);

    await DbConnection.connection
      .query(`INSERT INTO STATEMENTS(id, user_id, description, amount, type)
      values('${uuidV4()}', '${userId}', 'a new deposit statement', 999.99, 'deposit')
    `);

    await DbConnection.connection
      .query(`INSERT INTO STATEMENTS(id, user_id, description, amount, type)
      values('${uuidV4()}', '${userId}', 'a new deposit statement', 999.99, 'deposit')
    `);

    await DbConnection.connection
      .query(`INSERT INTO STATEMENTS(id, user_id, description, amount, type)
      values('${uuidV4()}', '${userId}', 'a new deposit statement', 999.99, 'withdraw')
    `);
  });

  afterAll(async () => {
    await DbConnection.close();
  });

  it("Should be able to get balance", async () => {
    const authenticationResponse = await request(app)
      .post("/api/v1/sessions")
      .send({ email: userData.email, password: userData.password });

    const { token } = authenticationResponse.body;

    const response = await request(app)
      .get("/api/v1/statements/balance")
      .set("authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("statement");
    expect(response.body).toHaveProperty("balance");
    expect(response.body.balance).toBe(999.99);
  });

  it("Should not be able to get balance if the user does not is authenticated", async () => {
    const response = await request(app)
      .get("/api/v1/statements/balance")
      .set("authorization", `Bearer invalid_token`);

    expect(response.statusCode).toBe(401);
  });
});
