import { getConfig } from './hooks/use-config';

export const api = {
  get: async <Result>(url: string) => request<Result>('GET', url),
  post: async (url: string, body: unknown) => request('POST', url, body),
  patch: async (url: string, body: unknown) => request('PATCH', url, body),
  delete: async (url: string) => request('DELETE', url),
};

const request = async <Result>(method: string, url: string, body?: unknown): Promise<Result> => {
  const token = localStorage.getItem('token');
  const { serverUrl } = getConfig();

  const headers = new Headers();

  const init: RequestInit = {
    method,
    headers,
  };

  if (body) {
    headers.set('Content-Type', 'application/json');
    init.body = JSON.stringify(body);
  }

  if (token) {
    headers.set('Authorization', token);
  }

  const response = await fetch(`${serverUrl}${url}`, init);

  if (!response.ok) {
    throw response;
  }

  if (response.headers.get('Content-Type')?.startsWith('application/json')) {
    return response.json() as Promise<Result>;
  }

  return undefined as Result;
};
