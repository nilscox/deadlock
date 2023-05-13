import { getConfig } from './hooks/use-config';

export const api = {
  async get<Result>(url: string) {
    const { serverUrl } = getConfig();
    const response = await fetch(`${serverUrl}${url}`);
    return response.json() as Promise<Result>;
  },

  async post(url: string, body: unknown) {
    const { serverUrl } = getConfig();
    await fetch(`${serverUrl}${url}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  },

  async patch(url: string, body: unknown) {
    const { serverUrl } = getConfig();
    await fetch(`${serverUrl}${url}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  },

  async delete(url: string) {
    const { serverUrl } = getConfig();
    await fetch(`${serverUrl}${url}`, {
      method: 'DELETE',
    });
  },
};
