export interface ConfigPort {
  server: {
    host: string;
    port: number;
  };
  database: {
    url: string;
    log: boolean;
    ssl: boolean;
  };
  admin: {
    token: string;
  };
}

export class EnvConfigAdapter {
  server = {
    host: this.parse(string, 'HOST'),
    port: this.parse(number, 'PORT'),
  };

  database = {
    url: this.parse(string, 'DATABASE_URL'),
    log: this.parse(boolean, 'DATABASE_LOG'),
    ssl: this.parse(boolean, 'DATABASE_SSL'),
  };

  admin = {
    token: this.parse(string, 'ADMIN_TOKEN'),
  };

  private parse<T>(parse: (value: string) => T, name: string): T {
    const value = process.env[name];

    if (value === undefined) {
      throw new Error(`Missing env ${name}`);
    }

    return parse(value);
  }
}

const string = (value: string) => value;
const number = (value: string) => parseInt(value, 10);
const boolean = (value: string) => value === 'true';

export class StubConfigAdapter implements ConfigPort {
  server = {
    host: '',
    port: 0,
  };

  database = {
    url: '',
    log: false,
    ssl: false,
  };

  admin = {
    token: '',
  };
}
