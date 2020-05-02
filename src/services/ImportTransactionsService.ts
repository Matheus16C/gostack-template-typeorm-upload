import csvParse from 'csv-parse';
import fs from 'fs';
import path from 'path';

import { getRepository } from 'typeorm';

import Transaction from '../models/Transaction';

class ImportTransactionsService {
  async execute(): Promise<Transaction[]> {
    const transactions: Transaction[] = [];

    const transactionRepository = getRepository(Transaction);

    const csvFIlePath = path.resolve(__dirname, '../../tmp/*.csv');

    const readCSVStream = fs.createReadStream(csvFIlePath);

    const parseStream = csvParse({
      from_line: 2,
      ltrim: true,
      rtrim: true,
    });

    const parseCSV = readCSVStream.pipe(parseStream);

    parseCSV.on('data', line => {
      const transaction = transactionRepository.create({
        title: line[0],
        type: line[1],
        value: line[2],
        category: line[3],
      });

      transactions.push(transaction);
    });

    await new Promise(resolve => {
      parseCSV.on('end', resolve);
    });

    return transactions;
  }
}

export default ImportTransactionsService;
