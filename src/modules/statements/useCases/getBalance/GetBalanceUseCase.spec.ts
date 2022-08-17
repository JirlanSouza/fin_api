import { hash } from "bcryptjs";
import { v4 as uuidV4 } from "uuid";

import { User } from "../../../users/entities/User";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { OperationType, Statement } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { GetBalanceError } from "./GetBalanceError";
import { GetBalanceUseCase } from "./GetBalanceUseCase";

describe("Get balance", () => {
  let getBalanceUseCase: GetBalanceUseCase;
  let inMemoryUsersRepository: IUsersRepository;
  let inMemoryStatementsRepository: IStatementsRepository;
  let user: User;

  beforeEach(async () => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    getBalanceUseCase = new GetBalanceUseCase(
      inMemoryStatementsRepository,
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

  it("Should be able get a balance", async () => {
    const createStatementData1 = {
      user_id: user.id as string,
      type: OperationType.DEPOSIT,
      amount: 1020,
      description: "new statement description",
    };

    const createStatementData2 = {
      user_id: user.id as string,
      type: OperationType.WITHDRAW,
      amount: 100,
      description: "new statement description",
    };

    const createStatementData3 = {
      user_id: user.id as string,
      type: OperationType.DEPOSIT,
      amount: 10,
      description: "new statement description",
    };

    const balance =
      createStatementData1.amount -
      createStatementData2.amount +
      createStatementData3.amount;

    await inMemoryStatementsRepository.create(createStatementData1);
    await inMemoryStatementsRepository.create(createStatementData2);
    await inMemoryStatementsRepository.create(createStatementData3);

    const getStatementOperationData = {
      user_id: user.id as string,
    };

    const balanceResult = await getBalanceUseCase.execute(
      getStatementOperationData
    );

    expect(balanceResult.balance).toBe(balance);
    expect(balanceResult.statement.length).toBe(3);
  });

  it("Should not be able get a balance if user does not exists", () => {
    expect(async () => {
      const getStatementOperationData = {
        user_id: uuidV4(),
      };

      await getBalanceUseCase.execute(getStatementOperationData);
    }).rejects.toBeInstanceOf(GetBalanceError);
  });
});
