import { hash } from "bcryptjs";

import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "../../repositories/IUsersRepository";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";

describe("Authenticate user", () => {
  let authenticateUserUseCase: AuthenticateUserUseCase;
  let inMemoryUsersRepository: IUsersRepository;

  beforeAll(() => {});

  beforeEach(async () => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    authenticateUserUseCase = new AuthenticateUserUseCase(
      inMemoryUsersRepository
    );

    const userData = {
      name: "new user",
      email: "newuser@finapi.com",
      password: "newuser",
    };

    const hashPassword = await hash(userData.password, 8);

    inMemoryUsersRepository.create({ ...userData, password: hashPassword });
  });

  it("Should be able authenticate user", async () => {
    const authenticationResult = await authenticateUserUseCase.execute({
      email: "newuser@finapi.com",
      password: "newuser",
    });

    expect(authenticationResult).toHaveProperty("token");
    expect(authenticationResult.user.name).toBe("new user");
    expect(authenticationResult.user.email).toBe("newuser@finapi.com");
  });

  it("Should not be able authenticate user with incorrect email", () => {
    expect(async () => {
      await authenticateUserUseCase.execute({
        email: "inexsistenuser@finapi.com",
        password: "newuser",
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });

  it("Should not be able authenticate with incorrect password", () => {
    expect(async () => {
      await authenticateUserUseCase.execute({
        email: "newuser@finapi.com",
        password: "incorrect password",
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });
});
