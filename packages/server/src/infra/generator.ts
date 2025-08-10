import { customAlphabet } from 'nanoid';

export interface GeneratorPort {
  id(): string;
}

export class NanoIdGeneratorAdapter implements GeneratorPort {
  private nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789');

  id(): string {
    return this.nanoid(8);
  }
}

export class StubGeneratorAdapter implements GeneratorPort {
  private nextId = '';

  id(): string {
    return this.nextId;
  }
}
