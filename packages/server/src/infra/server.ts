import { Server as HttpServer } from 'node:http';
import { promisify } from 'node:util';

import cors from 'cors';
import express, { type ErrorRequestHandler, type RequestHandler, Router } from 'express';

import type { ConfigPort } from './config.ts';
import type { LoggerPort } from './logger.ts';

export default class Server {
  private readonly config: ConfigPort;
  private readonly logger: LoggerPort;
  private readonly api: Router;

  private app = express();
  private server?: HttpServer;

  constructor(config: ConfigPort, logger: LoggerPort, api: Router) {
    this.config = config;
    this.logger = logger;
    this.api = api;

    this.init();
  }

  init() {
    this.logger.info('Initializing server');

    this.app.use(cors({ origin: true }));
    this.app.use(express.json());
    this.app.use(this.logRequest);
    this.app.use(this.api);
    this.app.use(this.notFound);
    this.app.use(this.errorHandler);
  }

  private logRequest: RequestHandler = (req, res, next) => {
    next();
    this.logger.debug(req.method, req.path, res.statusCode);
  };

  private notFound: RequestHandler = (req, res) => {
    res.status(404).end();
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private errorHandler: ErrorRequestHandler = (err, req, res, next) => {
    console.error(err);
    res.status(500).end();
  };

  async start() {
    const { host, port } = this.config.server;

    this.logger.info(`Start listening on ${host}:${String(port)}`);

    await new Promise<void>((resolve, reject) => {
      this.server = this.app.listen(port, host, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });

    this.logger.info('Server started');
  }

  async close() {
    if (!this.server) {
      return;
    }

    this.logger.info(`Closing server`);

    await promisify(this.server.close.bind(this.server))();

    this.logger.info(`Closing closed`);
  }
}
