import { getRepository } from 'typeorm';

import TransactionRepository from '../repositories/TransactionsRepository';

import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import Category from '../models/Category';

interface Request {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    type,
    value,
    category,
  }: Request): Promise<Transaction> {
    const transactionRepository = getRepository(Transaction);
    const categoryRepository = getRepository(Category);

    const checkCategoryExists = await categoryRepository.findOne({
      where: { title: category },
    });

    if (!checkCategoryExists) {
      const saveNewCategory = categoryRepository.create({
        title: category,
      });
      await categoryRepository.save(saveNewCategory);
    }

    const categoryFind = await categoryRepository.find({
      select: ['id'],
      where: { title: category },
    });

    const transactionBalance = new TransactionRepository();

    const balance = await transactionBalance.getBalance();
    if (type === 'outcome') {
      if (balance.total < value) {
        throw new AppError('insufficient funds', 400);
      }
    }

    const category_id = categoryFind[0].id;
    const transaction = transactionRepository.create({
      title,
      type,
      value,
      category_id,
    });

    await transactionRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
