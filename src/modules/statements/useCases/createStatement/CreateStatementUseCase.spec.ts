import { hash } from "bcryptjs";
import { v4 as uuidV4 } from "uuid";

import { User } from "../../../users/entities/User";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { OperationType } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { CreateStatementError } from "./CreateStatementError";
import { CreateStatementUseCase } from "./CreateStatementUseCase";

describe("Create statement", () => {
  let createStatementUseCase: CreateStatementUseCase;
  let inMemoryUsersRepository: IUsersRepository;
  let inMemoryStatementsRepository: IStatementsRepository;
  let user: User;

  beforeEach(async () => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
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

  it("Should be able create a new statement", async () => {
    const createStatementData = {
      user_id: user.id as string,
      type: OperationType.DEPOSIT,
      amount: 1020,
      description: "new statement description",
    };

    const statement = await createStatementUseCase.execute(createStatementData);

    expect(statement.user_id).toBe(user.id);
    expect(statement.type).toBe("deposit");
    expect(statement.amount).toBe(1020);
  });

  it("Should not be able create statement if user does not exists", () => {
    expect(async () => {
      const createStatementData = {
        user_id: uuidV4(),
        type: OperationType.DEPOSIT,
        amount: 1020,
        description: "new statement description",
      };

      await createStatementUseCase.execute(createStatementData);
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
  });

  it("Should not be able create statement with insufficient founds", () => {
    expect(async () => {
      const createStatementData = {
        user_id: user.id as string,
        type: OperationType.WITHDRAW,
        amount: 1020,
        description: "new statement description",
      };

      await createStatementUseCase.execute(createStatementData);
    }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds);
  });
});
