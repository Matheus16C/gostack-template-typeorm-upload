import { EntityRepository, Repository, getCustomRepository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const transactions = await transactionsRepository.find();
    const income = transactions.reduce(function sumIncome(
      acumulator: number,
      currentValue: Transaction,
    ): number {
      if (currentValue.type === 'income') {
        return acumulator + currentValue.value;
      }
      return acumulator;
    },
    0);
    const outcome = transactions.reduce(function sumOutcome(
      acumulator: number,
      currentValue: Transaction,
    ): number {
      if (currentValue.type === 'outcome') {
        return acumulator + currentValue.value;
      }
      return acumulator;
    },
    0);
    const total = income - outcome;

    const balance = { income, outcome, total };

    return balance;
  }
}

export default TransactionsRepository;
