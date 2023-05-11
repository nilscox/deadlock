import { assert } from '@deadlock/game';

type Config = {
  serverUrl: string;
};

const config: Config = {
  serverUrl: import.meta.env.VITE_APP_SERVER_URL as string,
};

assert(config.serverUrl, 'missing server url');

export const getConfig = () => config;
