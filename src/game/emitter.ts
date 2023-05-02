export type Listener<Event> = (event: Event) => void;

export class Emitter<Event> {
  private listeners = new Set<Listener<Event>>();

  addListener(listener: Listener<Event>): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  emit(event: Event) {
    this.listeners.forEach((listener) => listener(event));
  }
}
