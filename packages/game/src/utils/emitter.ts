import { MapSet } from './map-set.ts';

export type Listener<Event> = (event: Event) => void;

export class Emitter<EventsMap extends Record<string, unknown>> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private listeners = new MapSet<keyof EventsMap, Listener<any>>();
  private children = new Set<Emitter<EventsMap>>();

  cloneEmitter(): Emitter<EventsMap> {
    const child = new Emitter<EventsMap>();

    this.children.add(child);

    return child;
  }

  addListener<T extends keyof EventsMap>(type: T, listener: Listener<EventsMap[T]>): () => void {
    this.listeners.add(type, listener);
    return () => this.removeListener(type, listener);
  }

  removeListener<T extends keyof EventsMap>(type: T, listener: Listener<EventsMap[T]>) {
    this.listeners.get(type)?.delete(listener);
  }

  removeListeners(type?: keyof EventsMap) {
    if (type) {
      this.listeners.get(type)?.clear();
    } else {
      this.listeners.forEach((listener) => listener.clear());
      this.listeners.clear();
    }
  }

  once<T extends keyof EventsMap>(type: T, listener: Listener<EventsMap[T]>): void {
    const removeListener = this.addListener(type, (payload) => {
      removeListener();
      listener(payload);
    });
  }

  emit<T extends keyof EventsMap>(type: T, ...event: EventsMap[T] extends never ? [] : [EventsMap[T]]) {
    this.listeners.get(type)?.forEach((listener) => listener(event[0]));

    for (const child of this.children) {
      child.emit(type, ...event);
    }
  }
}
