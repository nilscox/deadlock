import type { LevelData } from '@deadlock/game';

import type { OmitNever } from './types';

/* eslint-disable @typescript-eslint/no-invalid-void-type */

export type SessionData = {
  levelId: string;
  time: number;
  completed: boolean;
};

export const api = {
  getLevels: endpoint<LevelData[]>('GET', '/levels'),
  createLevelSession: endpoint<string, SessionData>('POST', '/session'),
  updateLevelSession: endpoint<void, SessionData, 'sessionId'>('PUT', '/session/:sessionId'),
};

type Method = 'GET' | 'POST' | 'PUT' | 'DELETE';

type EndpointParams<Body, Param extends string = never> = [Body, Param] extends [never, never]
  ? void
  : OmitNever<{
      body: Body;
      params: Param extends string ? Record<Param, string> : never;
    }>;

function endpoint<Result, Body = never, Params extends string = never>(method: Method, path: string) {
  return async (args: EndpointParams<Body, Params>) => {
    const { body, params }: { body: unknown; params: Record<string, string> } = {
      body: undefined,
      params: {},
      ...args,
    };

    const headers = new Headers();
    const init: RequestInit = { method, headers };

    const url = new URL(import.meta.env.VITE_APP_SERVER_URL + path);

    for (const [key, value] of Object.entries(params)) {
      url.pathname = url.pathname.replaceAll(`:${key}`, value);
    }

    if (body !== undefined) {
      init.body = JSON.stringify(body);
      headers.set('Content-Type', 'application/json');
    }

    const response = await fetch(url, init);
    const contentType = response.headers.get('Content-Type');

    const result: unknown = contentType?.startsWith('application/json')
      ? await response.json()
      : await response.text();

    if (!response.ok) {
      throw new ApiError(response, result);
    }

    return result as Result;
  };
}

class ApiError extends Error {
  constructor(
    public readonly response: Response,
    public readonly body: unknown,
  ) {
    super(`API error: ${String(response.status)} ${response.statusText}`);
  }
}
