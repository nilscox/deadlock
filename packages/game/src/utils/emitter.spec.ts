import assert from 'node:assert';
import test, { type Mock, beforeEach, mock, suite } from 'node:test';

import { Emitter } from './emitter.ts';

type TestEventsMap = {
  move: 'left' | 'right';
  jump: never;
};

class TestEmitter extends Emitter<TestEventsMap> {}

await suite('Emitter', async () => {
  let onJump: Mock<() => void>;
  let onMove: Mock<(direction: 'left' | 'right') => void>;

  beforeEach(() => {
    onJump = mock.fn();
    onMove = mock.fn();
  });

  await test('binds a listener to an event', () => {
    const emitter = new TestEmitter();

    emitter.addListener('jump', onJump);
    emitter.emit('jump');

    assert.strictEqual(onJump.mock.callCount(), 1);
    assert.strictEqual(onMove.mock.callCount(), 0);
  });

  await test('binds a listener to an event with payload', () => {
    const emitter = new TestEmitter();
    const onMove = mock.fn();

    emitter.addListener('move', onMove);
    emitter.emit('move', 'left');

    assert.strictEqual(onJump.mock.callCount(), 0);
    assert.strictEqual(onMove.mock.callCount(), 1);
    assert.deepStrictEqual(onMove.mock.calls[0]?.arguments, ['left']);
  });

  await test('removes a listener', () => {
    const emitter = new TestEmitter();
    const onJump = mock.fn();

    emitter.addListener('jump', onJump);
    emitter.removeListener('jump', onJump);

    emitter.emit('jump');

    assert.strictEqual(onJump.mock.callCount(), 0);
  });

  await test('removes a listener using the returned callback', () => {
    const emitter = new TestEmitter();
    const onJump = mock.fn();

    const unsubscribe = emitter.addListener('jump', onJump);
    unsubscribe();

    emitter.emit('jump');

    assert.strictEqual(onJump.mock.callCount(), 0);
  });

  await test('removes all listeners for an event type', () => {
    const emitter = new TestEmitter();
    const onJump = mock.fn();

    emitter.addListener('jump', onJump);
    emitter.addListener('move', onMove);

    emitter.removeListeners('jump');

    emitter.emit('jump');
    emitter.emit('move', 'left');

    assert.strictEqual(onJump.mock.callCount(), 0);
    assert.strictEqual(onMove.mock.callCount(), 1);
  });

  await test('removes all listeners', () => {
    const emitter = new TestEmitter();
    const onJump = mock.fn();

    emitter.addListener('jump', onJump);
    emitter.addListener('move', onMove);

    emitter.removeListeners();

    emitter.emit('jump');
    emitter.emit('move', 'left');

    assert.strictEqual(onJump.mock.callCount(), 0);
    assert.strictEqual(onMove.mock.callCount(), 0);
  });

  await test('binds a listener to an event once', () => {
    const emitter = new TestEmitter();
    const onJump = mock.fn();

    emitter.once('jump', onJump);

    emitter.emit('jump');
    emitter.emit('jump');

    assert.strictEqual(onJump.mock.callCount(), 1);
  });

  await test('clones an emitter', () => {
    const emitter = new TestEmitter();
    const clone = emitter.cloneEmitter();

    const onJump2 = mock.fn();

    emitter.addListener('jump', onJump);
    clone.addListener('jump', onJump2);

    emitter.emit('jump');

    assert.strictEqual(onJump.mock.callCount(), 1);
    assert.strictEqual(onJump2.mock.callCount(), 1);
  });

  await test('removes all listeners on a cloned emitter', () => {
    const emitter = new TestEmitter();
    const clone = emitter.cloneEmitter();

    const onJump2 = mock.fn();

    emitter.addListener('jump', onJump);
    clone.addListener('jump', onJump2);

    clone.removeListeners();

    emitter.emit('jump');

    assert.strictEqual(onJump.mock.callCount(), 1);
    assert.strictEqual(onJump2.mock.callCount(), 0);
  });
});
