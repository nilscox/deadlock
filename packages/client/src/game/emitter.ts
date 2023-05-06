export type Listener<Event> = (event: Event) => void;

// eslint-disable-next-line @typescript-eslint/ban-types
export class Emitter<Type extends string, EventsMap extends Partial<Record<Type, unknown>> = {}> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private listeners = new MapSet<string, Listener<any>>();
  private children = new Set<Emitter<Type, EventsMap>>();

  cloneEmitter(): Emitter<Type, EventsMap> {
    const child = new Emitter<Type, EventsMap>();

    this.children.add(child);

    return child;
  }

  addListener<T extends Type>(type: T, listener: Listener<EventsMap[T]>): () => void {
    this.listeners.add(type, listener);
    return () => this.removeListener(type, listener);
  }

  removeListener<T extends Type>(type: T, listener: Listener<EventsMap[T]>) {
    this.listeners.get(type)?.delete(listener);
  }

  removeListeners(type?: Type) {
    if (type) {
      this.listeners.get(type)?.clear();
    } else {
      this.listeners.forEach((listener) => listener.clear());
      this.listeners.clear();
    }
  }

  emit<T extends Type>(type: T, ...event: T extends keyof EventsMap ? [EventsMap[T]] : []) {
    this.listeners.get(type)?.forEach((listener) => listener(event[0]));

    for (const child of this.children) {
      child.emit(type, ...event);
    }
  }
}

class MapSet<K, T> extends Map<K, Set<T>> {
  add(key: K, value: T) {
    if (!this.has(key)) {
      this.set(key, new Set());
    }

    this.get(key)?.add(value);
  }
}
