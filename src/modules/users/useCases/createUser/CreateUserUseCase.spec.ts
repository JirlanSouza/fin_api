import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "../../repositories/IUsersRepository";
import { CreateUserError } from "./CreateUserError";
import { CreateUserUseCase } from "./CreateUserUseCase";

describe("Create user", () => {
  let createUserUseCase: CreateUserUseCase;
  let inMemoryUsersRepository: IUsersRepository;

  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  });

  it("Should be able create a new user", async () => {
    const userData = {
      name: "new user",
      email: "newuser@finapi.com",
      password: "newuser",
    };

    const user = await createUserUseCase.execute(userData);

    expect(user).toHaveProperty("id");
    expect(user.name).toEqual(userData.name);
    expect(user.email).toEqual(userData.email);
    expect(user.password === userData.password).toBe(false);
  });

  it("Should not be able create a new user if user already exists", () => {
    expect(async () => {
      const userData = {
        name: "new user",
        email: "newuser@finapi.com",
        password: "newuser",
      };

      await createUserUseCase.execute(userData);

      await createUserUseCase.execute(userData);
    }).rejects.toBeInstanceOf(CreateUserError);
  });
});
