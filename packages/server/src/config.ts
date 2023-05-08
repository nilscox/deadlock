import dotenv from 'dotenv';

dotenv.config();

const {
  HOST: host = 'localhost',
  PORT: port = '3000',
  DB_PATH: dbPath = './db.sqlite',
  DB_DEBUG: dbDebug = 'false',
} = process.env;

export const config = {
  host,
  port,
  dbPath,
  dbDebug,
};
