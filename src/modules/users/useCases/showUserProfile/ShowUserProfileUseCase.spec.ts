import { hash } from "bcryptjs";
import { v4 as uuidV4 } from "uuid";

import { User } from "../../entities/User";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "../../repositories/IUsersRepository";
import { ShowUserProfileError } from "./ShowUserProfileError";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

describe("Show user profile", () => {
  let showUserProfileUseCase: ShowUserProfileUseCase;
  let inMemoryUsersRepository: IUsersRepository;
  let user: User;

  beforeEach(async () => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    showUserProfileUseCase = new ShowUserProfileUseCase(
      inMemoryUsersRepository
    );

    const userData = {
      name: "new user",
      email: "newuser@finapi.com",
      password: "newuser",
    };

    const hashPassword = await hash(userData.password, 8);

    user = await inMemoryUsersRepository.create({
      ...userData,
      password: hashPassword,
    });
  });

  it("Should be able show user profile", async () => {
    const userId = user.id as string;

    const userProfile = await showUserProfileUseCase.execute(userId);

    expect(userProfile).toEqual(user);
  });

  it("Should not be able show user profile if user does not exists", () => {
    expect(async () => {
      const userId = uuidV4();

      await showUserProfileUseCase.execute(userId);
    }).rejects.toBeInstanceOf(ShowUserProfileError);
  });
});
