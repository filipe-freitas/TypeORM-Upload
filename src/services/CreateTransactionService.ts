import { getCustomRepository, getRepository } from 'typeorm';

import AppError from '../errors/AppError';
import Category from '../models/Category';
import Transaction from '../models/Transaction';
import TransactionsRespository from '../repositories/TransactionsRepository';

interface Request {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category_title: string;
}

class CreateTransactionService {
  public async execute({
    title,
    type,
    value,
    category_title,
  }: Request): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionsRespository);
    const categoriesRepository = getRepository(Category);

    // should create tags when inserting new transactions
    // should not create tags when they already exist
    const category =
      (await categoriesRepository.findOne({
        where: { title: category_title },
      })) || categoriesRepository.create({ title: category_title });

    await categoriesRepository.save(category);

    // should not be able to create outcome transaction without a valid balance
    const { total } = await transactionsRepository.getBalance();
    if (type === 'outcome' && value > total) {
      throw new AppError('Not enough money to complete this transaction.', 400);
    }

    // should be able to create new transaction
    const transaction = transactionsRepository.create({
      title,
      type,
      value,
      category_id: category.id,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
