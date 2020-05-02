import { Router } from 'express';
import { getCustomRepository } from 'typeorm';

import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';

const transactionsRouter = Router();

transactionsRouter.get('/', async (request, response) => {
  try {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const transactions = await transactionsRepository.find({
      select: ['id', 'title', 'value', 'type', 'created_at', 'updated_at'],
      relations: ['category'],
    });

    const balance = await transactionsRepository.getBalance();

    return response.json({ transactions, balance });
  } catch (err) {
    return response.status(400).json({ error: err.message });
  }
});

transactionsRouter.post('/', async (request, response) => {
  const { title, type, value, category } = request.body;

  const createTransaction = new CreateTransactionService();

  const transaction = await createTransaction.execute({
    title,
    type,
    value,
    category,
  });

  return response.json(transaction);
});

transactionsRouter.delete('/:id', async (request, response) => {
  const { id } = request.params;

  const deleteTransaction = new DeleteTransactionService();

  await deleteTransaction.execute(id);

  return response.status(204).send();
});

transactionsRouter.post('/import', async (request, response) => {
  const importTransactionsService = new ImportTransactionsService();
  const transactions = await importTransactionsService.execute();

  const createTransaction = new CreateTransactionService();

  transactions.forEach(async transaction => {
    const { title, type, value, category } = transaction;
    const categoryString = category.toString();
    const newTransaction = await createTransaction.execute({
      title,
      type,
      value,
      category: categoryString,
    });
    console.log(newTransaction);
  });

  return response.json(transactions);
});

export default transactionsRouter;
