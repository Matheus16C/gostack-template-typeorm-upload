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

    let categoryFind = categoryRepository.create({
      title: category,
    });
    if (checkCategoryExists) {
      categoryFind = await categoryRepository.getId(categoryFind);
      console.log(categoryFind);
    } else {
      await categoryRepository.save(categoryFind);
    }
    const transactionBalance = new TransactionRepository();

    const balance = await transactionBalance.getBalance();
    if (type === 'outcome') {
      if (balance.total < value) {
        throw new AppError('insufficient funds', 400);
      }
    }

    const category_id = categoryFind.id;
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
