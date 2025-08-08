import { Mock, beforeEach, expect, vi } from 'vitest';

import { Emitter } from './emitter';

enum TestEvent {
  move = 'move',
  jump = 'jump',
}

type TestEventsMap = {
  [TestEvent.move]: 'left' | 'right';
};

class TestEmitter extends Emitter<TestEvent, TestEventsMap> {}

describe('Emitter', () => {
  let onJump: Mock<() => void>;
  let onMove: Mock<(direction: 'left' | 'right') => void>;

  beforeEach(() => {
    onJump = vi.fn();
    onMove = vi.fn();
  });

  it('binds a listener to an event', () => {
    const emitter = new TestEmitter();

    emitter.addListener(TestEvent.jump, onJump);
    emitter.emit(TestEvent.jump);

    expect(onJump).toHaveBeenCalledWith(undefined);
    expect(onMove).not.toHaveBeenCalled();
  });

  it('binds a listener to an event with payload', () => {
    const emitter = new TestEmitter();
    const onMove = vi.fn();

    emitter.addListener(TestEvent.move, onMove);
    emitter.emit(TestEvent.move, 'left');

    expect(onJump).not.toHaveBeenCalled();
    expect(onMove).toHaveBeenCalledWith('left');
  });

  it('removes a listener', () => {
    const emitter = new TestEmitter();
    const onJump = vi.fn();

    emitter.addListener(TestEvent.jump, onJump);
    emitter.removeListener(TestEvent.jump, onJump);

    emitter.emit(TestEvent.jump);

    expect(onJump).not.toHaveBeenCalled();
  });

  it('removes a listener using the returned callback', () => {
    const emitter = new TestEmitter();
    const onJump = vi.fn();

    const unsubscribe = emitter.addListener(TestEvent.jump, onJump);
    unsubscribe();

    emitter.emit(TestEvent.jump);

    expect(onJump).not.toHaveBeenCalled();
  });

  it('removes all listeners for an event type', () => {
    const emitter = new TestEmitter();
    const onJump = vi.fn();

    emitter.addListener(TestEvent.jump, onJump);
    emitter.addListener(TestEvent.move, onMove);

    emitter.removeListeners(TestEvent.jump);

    emitter.emit(TestEvent.jump);
    emitter.emit(TestEvent.move, 'left');

    expect(onJump).not.toHaveBeenCalled();
    expect(onMove).toHaveBeenCalled();
  });

  it('removes all listeners', () => {
    const emitter = new TestEmitter();
    const onJump = vi.fn();

    emitter.addListener(TestEvent.jump, onJump);
    emitter.addListener(TestEvent.move, onMove);

    emitter.removeListeners();

    emitter.emit(TestEvent.jump);
    emitter.emit(TestEvent.move, 'left');

    expect(onJump).not.toHaveBeenCalled();
    expect(onMove).not.toHaveBeenCalled();
  });

  it('binds a listener to an event once', () => {
    const emitter = new TestEmitter();
    const onJump = vi.fn();

    emitter.once(TestEvent.jump, onJump);

    emitter.emit(TestEvent.jump);
    emitter.emit(TestEvent.jump);

    expect(onJump).toHaveBeenCalledTimes(1);
  });

  it('clones an emitter', () => {
    const emitter = new TestEmitter();
    const clone = emitter.cloneEmitter();

    const onJump2 = vi.fn();

    emitter.addListener(TestEvent.jump, onJump);
    clone.addListener(TestEvent.jump, onJump2);

    emitter.emit(TestEvent.jump);

    expect(onJump).toHaveBeenCalled();
    expect(onJump2).toHaveBeenCalled();
  });

  it('removes all listeners on a cloned emitter', () => {
    const emitter = new TestEmitter();
    const clone = emitter.cloneEmitter();

    const onJump2 = vi.fn();

    emitter.addListener(TestEvent.jump, onJump);
    clone.addListener(TestEvent.jump, onJump2);

    clone.removeListeners();

    emitter.emit(TestEvent.jump);

    expect(onJump).toHaveBeenCalled();
    expect(onJump2).not.toHaveBeenCalled();
  });
});
