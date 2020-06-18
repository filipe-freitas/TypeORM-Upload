import multer from 'multer';
import { Router } from 'express';
import { getCustomRepository } from 'typeorm';

import uploadConfig from '../config/upload';

import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';

const transactionsRouter = Router();

const upload = multer(uploadConfig);

transactionsRouter.get('/', async (request, response) => {
  const transactionsRespository = getCustomRepository(TransactionsRepository);

  // should be able to list transactions
  const transactions = await transactionsRespository.find();
  const balance = await transactionsRespository.getBalance();

  return response.json({ transactions, balance });
});

transactionsRouter.post('/', async (request, response) => {
  const { title, type, value, category } = request.body;

  const createTransaction = new CreateTransactionService();

  const transaction = await createTransaction.execute({
    title,
    type,
    value,
    category_title: category,
  });

  return response.json(transaction);
});

transactionsRouter.delete('/:id', async (request, response) => {
  const { id } = request.params;

  const deleteTransaction = new DeleteTransactionService();

  await deleteTransaction.execute({ id });

  return response.json({ message: 'Transaction removed' });
});

transactionsRouter.post(
  '/import',
  upload.single('file'),
  async (request, response) => {
    // TODO
    const csvFileName = request.file.filename;

    const importTransactions = new ImportTransactionsService();

    const transactionsImported = await importTransactions.execute({
      csvFileName,
    });

    const createTransaction = new CreateTransactionService();

    for (let index = 0; index < transactionsImported.length; index++) {
      await createTransaction.execute({
        title: transactionsImported[index].title,
        type: transactionsImported[index].type,
        value: transactionsImported[index].value,
        category_title: transactionsImported[index].category,
      });
    }

    return response.json(transactionsImported);
  },
);

export default transactionsRouter;
