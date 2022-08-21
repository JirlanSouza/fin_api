import { hash } from "bcryptjs";
import request from "supertest";
import { v4 as uuidV4 } from "uuid";
import { app } from "../../../../app";
import { DbConnection } from "../../../../database";

describe("Create statement controller", () => {
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

  it("Should be able create a new deposit statement", async () => {
    const passwordHash = await hash(userData.password, 8);
    await DbConnection.connection
      .query(`INSERT INTO USERS(id, name, email, password)
      values('${userId}', 'new user', '${userData.email}', '${passwordHash}')
    `);

    const authenticationResponse = await request(app)
      .post("/api/v1/sessions")
      .send({ email: userData.email, password: userData.password });

    const { token } = authenticationResponse.body;

    const response = await request(app)
      .post("/api/v1/statements/deposit")
      .set("authorization", `Bearer ${token}`)
      .send({ amount: 999.99, description: "a new deposit statement" });

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty("id");
    expect(response.body).toHaveProperty("user_id");
    expect(response.body).toHaveProperty("description");
    expect(response.body).toHaveProperty("amount");
    expect(response.body).toHaveProperty("type");
    expect(response.body).toHaveProperty("created_at");
    expect(response.body).toHaveProperty("updated_at");
  });

  it("Should be able create a new withdraw statement", async () => {
    const passwordHash = await hash(userData.password, 8);
    await DbConnection.connection
      .query(`INSERT INTO USERS(id, name, email, password)
      values('${userId}', 'new user', '${userData.email}', '${passwordHash}')
    `);

    await DbConnection.connection
      .query(`INSERT INTO STATEMENTS(id, user_id, description, amount, type)
      values('${uuidV4()}', '${userId}', 'a new deposit statement', 999.99, 'deposit')
    `);

    const authenticationResponse = await request(app)
      .post("/api/v1/sessions")
      .send({ email: userData.email, password: userData.password });

    const { token } = authenticationResponse.body;

    const response = await request(app)
      .post("/api/v1/statements/withdraw")
      .set("authorization", `Bearer ${token}`)
      .send({ amount: 99.99, description: "a new withdraw statement" });

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty("id");
    expect(response.body).toHaveProperty("user_id");
    expect(response.body).toHaveProperty("description");
    expect(response.body).toHaveProperty("amount");
    expect(response.body).toHaveProperty("type");
    expect(response.body).toHaveProperty("created_at");
    expect(response.body).toHaveProperty("updated_at");
  });

  it("Should not be able to create a new statement if the user does not is authenticated", async () => {
    const response = await request(app)
      .post("/api/v1/statements/deposit")
      .send({ amount: 999.99, description: "a new deposit statement" });

    expect(response.statusCode).toBe(401);
  });

  it("Should not be able to create a new withdraw statement with insufficient founds", async () => {
    const passwordHash = await hash(userData.password, 8);
    await DbConnection.connection
      .query(`INSERT INTO USERS(id, name, email, password)
      values('${userId}', 'new user', '${userData.email}', '${passwordHash}')
    `);

    await DbConnection.connection
      .query(`INSERT INTO STATEMENTS(id, user_id, description, amount, type)
      values('${uuidV4()}', '${userId}', 'a new deposit statement', 99.99, 'deposit')
    `);

    const authenticationResponse = await request(app)
      .post("/api/v1/sessions")
      .send({ email: userData.email, password: userData.password });

    const { token } = authenticationResponse.body;

    const response = await request(app)
      .post("/api/v1/statements/withdraw")
      .set("authorization", `Bearer ${token}`)
      .send({ amount: 199.99, description: "a new withdraw statement" });

    expect(response.statusCode).toBe(400);
  });
});
