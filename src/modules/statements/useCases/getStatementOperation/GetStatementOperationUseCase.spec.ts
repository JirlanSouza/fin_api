import { hash } from "bcryptjs";
import { v4 as uuidV4 } from "uuid";

import { User } from "../../../users/entities/User";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { OperationType, Statement } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { GetStatementOperationError } from "./GetStatementOperationError";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

describe("Get statement operation", () => {
  let getStatementOperationUseCase: GetStatementOperationUseCase;
  let inMemoryUsersRepository: IUsersRepository;
  let inMemoryStatementsRepository: IStatementsRepository;
  let user: User;
  let statement: Statement;

  beforeEach(async () => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    getStatementOperationUseCase = new GetStatementOperationUseCase(
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

    const createStatementData = {
      user_id: user.id as string,
      type: OperationType.DEPOSIT,
      amount: 1020,
      description: "new statement description",
    };

    statement = await inMemoryStatementsRepository.create(createStatementData);
  });

  it("Should be able get a statement operation", async () => {
    const getStatementOperationData = {
      user_id: user.id as string,
      statement_id: statement.id as string,
    };

    const statementOperation = await getStatementOperationUseCase.execute(
      getStatementOperationData
    );

    expect(statementOperation).toEqual(statement);
  });

  it("Should not be able get a statement operation if user does not exists", () => {
    expect(async () => {
      const getStatementOperationData = {
        user_id: uuidV4(),
        statement_id: statement.id as string,
      };

      await getStatementOperationUseCase.execute(getStatementOperationData);
    }).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound);
  });

  it("Should not be able get a statement operation with insufficient founds", () => {
    expect(async () => {
      const getStatementOperationData = {
        user_id: user.id as string,
        statement_id: uuidV4(),
      };

      await getStatementOperationUseCase.execute(getStatementOperationData);
    }).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound);
  });
});
