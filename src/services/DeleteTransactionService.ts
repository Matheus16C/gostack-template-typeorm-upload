import { getRepository } from 'typeorm';

import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';

class DeleteTransactionService {
  public async execute(transaction_id: string): Promise<void> {
    const transactionRepository = getRepository(Transaction);

    const transaction = await transactionRepository.findOne(transaction_id);

    if (!transaction) {
      throw new AppError('Cannot found transaction', 401);
    }

    await transactionRepository.delete(transaction_id);
  }
}

export default DeleteTransactionService;
