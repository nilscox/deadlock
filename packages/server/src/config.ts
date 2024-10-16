import { assert } from '@deadlock/game';
import dotenv from 'dotenv';

dotenv.config();

const {
  HOST: host = 'localhost',
  PORT: port = '3000',
  DB_URL: dbUrl,
  DB_SSL: dbSsl,
  DB_DEBUG: dbDebug,
} = process.env;

assert(dbUrl, 'missing DB_URL');

export const config = {
  host,
  port,
  dbUrl,
  dbSsl: dbSsl === 'true',
  dbDebug: dbDebug === 'true',
};
