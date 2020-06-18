import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';

import Transaction from '../models/Transaction';
import uploadConfig from '../config/upload';

interface Request {
  csvFileName: string;
}

interface CsvPattern {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class ImportTransactionsService {
  async execute({ csvFileName }: Request): Promise<CsvPattern[]> {
    const csvData: CsvPattern[] = [];

    const filePath = path.resolve(uploadConfig.directory, csvFileName);
    const readStream = fs.createReadStream(filePath);

    const stream = new Promise((resolve, reject) => {
      readStream
        .pipe(
          csv({
            mapValues: ({ value }) => value.trim(),
            mapHeaders: ({ header }) => header.trim(),
          }),
        )
        .on('data', data =>
          csvData.push({
            title: data.title as string,
            type: data.type as 'income' | 'outcome',
            value: data.value as number,
            category: data.category as string,
          }),
        )
        .on('end', () => resolve())
        .on('error', error => reject(error));
    });

    await stream;

    return csvData;
  }
}

export default ImportTransactionsService;
