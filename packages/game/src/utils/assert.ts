export class AssertionError extends Error {
  constructor(message = 'Assertion error') {
    super(message);
  }
}

export function assert(value: unknown, message?: string): asserts value {
  if (!value) {
    throw new AssertionError(message);
  }
}

export function defined<T>(value: T | undefined, message?: string): T {
  assert(value, message);
  return value;
}
