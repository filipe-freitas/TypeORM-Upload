import { getCustomRepository } from 'typeorm';
import TransactionRepository from '../repositories/TransactionsRepository';
import AppError from '../errors/AppError';

interface Request {
  id: string;
}

class DeleteTransactionService {
  public async execute({ id }: Request): Promise<void> {
    const transactionsRepository = getCustomRepository(TransactionRepository);
    const transaction = await transactionsRepository.findOne({ where: { id } });

    if (!transaction) {
      throw new AppError('Transaction not found', 400);
    }

    // should be able to delete a transaction
    await transactionsRepository.remove(transaction);
  }
}

export default DeleteTransactionService;
