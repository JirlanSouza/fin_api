import { hash } from "bcryptjs";
import request from "supertest";
import { v4 as uuidV4 } from "uuid";
import { app } from "../../../../app";
import { DbConnection } from "../../../../database";

describe("Get statement operation controller", () => {
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

  it("Should be able get statement operation", async () => {
    const passwordHash = await hash(userData.password, 8);
    await DbConnection.connection
      .query(`INSERT INTO USERS(id, name, email, password)
      values('${userId}', 'new user', '${userData.email}', '${passwordHash}')
    `);

    const statementId = uuidV4();

    await DbConnection.connection
      .query(`INSERT INTO STATEMENTS(id, user_id, description, amount, type)
      values('${statementId}', '${userId}', 'a new deposit statement', 999.99, 'deposit')
    `);

    const authenticationResponse = await request(app)
      .post("/api/v1/sessions")
      .send({ email: userData.email, password: userData.password });

    const { token } = authenticationResponse.body;

    const response = await request(app)
      .get(`/api/v1/statements/${statementId}`)
      .set("authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("id");
    expect(response.body).toHaveProperty("user_id");
    expect(response.body).toHaveProperty("description");
    expect(response.body).toHaveProperty("amount");
    expect(response.body).toHaveProperty("type");
    expect(response.body).toHaveProperty("created_at");
    expect(response.body).toHaveProperty("updated_at");
  });

  it("Should not be able to get statement operation if the user does not is authenticated", async () => {
    const passwordHash = await hash(userData.password, 8);
    await DbConnection.connection
      .query(`INSERT INTO USERS(id, name, email, password)
      values('${userId}', 'new user', '${userData.email}', '${passwordHash}')
    `);

    const statementId = uuidV4();

    await DbConnection.connection
      .query(`INSERT INTO STATEMENTS(id, user_id, description, amount, type)
      values('${statementId}', '${userId}', 'a new deposit statement', 999.99, 'deposit')
    `);

    const response = await request(app)
      .get(`/api/v1/statements/${statementId}`)
      .set("authorization", `Bearer invalid_token`);

    expect(response.statusCode).toBe(401);
  });

  it("Should not be able to get statement operation if the statement does not exist", async () => {
    const passwordHash = await hash(userData.password, 8);
    await DbConnection.connection
      .query(`INSERT INTO USERS(id, name, email, password)
      values('${userId}', 'new user', '${userData.email}', '${passwordHash}')
    `);

    const statementId = uuidV4();

    await DbConnection.connection
      .query(`INSERT INTO STATEMENTS(id, user_id, description, amount, type)
      values('${statementId}', '${userId}', 'a new deposit statement', 999.99, 'deposit')
    `);

    const authenticationResponse = await request(app)
      .post("/api/v1/sessions")
      .send({ email: userData.email, password: userData.password });

    const { token } = authenticationResponse.body;

    const response = await request(app)
      .get(`/api/v1/statements/${uuidV4()}`)
      .set("authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(404);
  });
});
