import { IncomingMessage, ServerResponse, createServer } from 'node:http';
import fs from 'node:fs/promises';
import assert from 'node:assert';

const { HOST: host = '0.0.0.0', PORT: port = '3000', DB_PATH: dbPath = './db.json' } = process.env;
const db: unknown[] = [];

startServer().catch(console.error);

async function startServer() {
  await loadDb();

  const server = createServer(async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS' && req.url === '/') {
      res.end();
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
