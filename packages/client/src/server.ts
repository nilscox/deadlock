import { IncomingMessage, ServerResponse, createServer } from 'node:http';
import fs from 'node:fs/promises';
import assert from 'node:assert';
import { LevelStats, toObject } from './game/utils';

const { HOST: host = '0.0.0.0', PORT: port = '3000', DB_PATH: dbPath = './db.json' } = process.env;

type DbRow = {
  ip: string;
  date: string;
  levelId: string;
  completed: boolean;
  time: number;
  tries: number;
};

const db: DbRow[] = [];

startServer().catch(console.error);

async function startServer() {
  await loadDb();

  const server = createServer(async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS' && req.url === '/') {
      res.end();
    }

    if (req.method === 'GET' && req.url === '/') {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.write(Buffer.from(JSON.stringify(formatDb())));
      res.end();
      return;
    }

    if (req.method === 'POST' && req.url === '/') {
      saveReport(req, res);
      return;
    }

    res.statusCode = 404;
    res.end();
  });

  server.listen(Number(port), host, () => {
    console.log(`server listening on ${host}:${port}`);
  });
}

async function loadDb() {
  db.push(...JSON.parse((await fs.readFile(dbPath)).toString()));
}

async function saveDb() {
  await fs.writeFile(dbPath, JSON.stringify(db, null, 2));
}

function formatDb() {
  return toObject(
    db.map((row) => row.levelId),
    (id) => id,
    (id) => getLevelData(id)
  );
}

function getLevelData(levelId: string): LevelStats {
  const rows = db.filter((row) => row.levelId === levelId);

  return {
    played: rows.length,
    completed: rows.filter((row) => row.completed).length,
    skipped: rows.filter((row) => !row.completed).length,
    tries: {
      mean: mean(rows.map((row) => row.tries)),
      min: max(rows.map((row) => row.tries)),
      max: min(rows.map((row) => row.tries)),
    },
    playTime: {
      mean: mean(rows.map((row) => row.time)),
      min: max(rows.map((row) => row.time)),
      max: min(rows.map((row) => row.time)),
    },
  };
}

const round = (value: number, precision: number) => {
  const p10 = Math.pow(10, precision);
  return Math.round(p10 * value) / p10;
};

const mean = (values: number[]) => {
  return round(sum(values) / values.length, 2);
};

const sum = (values: number[]) => {
  return values.reduce((a, b) => a + b, 0);
};

const min = (values: number[]) => {
  return Math.min(...values);
};

const max = (values: number[]) => {
  return Math.max(...values);
};

async function saveReport(req: IncomingMessage, res: ServerResponse) {
  const date = new Date().toISOString();
  const ip = req.headers['x-forwarded-for'] ?? req.socket.remoteAddress;

  let data = '';

  req.on('data', (buf: Buffer) => {
    data += buf.toString();
  });

  req.on('end', () => {
    try {
      const body = JSON.parse(data);

      assert(typeof body.levelId === 'string');
      assert(typeof body.completed === 'boolean');
      assert(typeof body.time === 'number');
      assert(typeof body.tries === 'number');

      db.push({
        ...body,
        ip,
        date,
      });

      console.log(
        [
          date,
          ip,
          body.completed ? 'completed' : 'skipped',
          `level ${body.levelId}`,
          `in ${body.time}ms`,
          `(${body.tries} tries)`,
        ].join(' ')
      );

      saveDb().catch(console.error);
    } catch (error) {
      console.error(error);
      console.log({ data });
    }

    res.statusCode = 204;
    res.end();
  });
}
