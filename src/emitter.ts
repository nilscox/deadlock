export type Listener<Event> = (event: Event) => void;

export class Emitter<Event> {
  private listeners = new Array<Listener<Event>>();

  addListener(listener: Listener<Event>): void {
    this.listeners.push(listener);
  }

  emit(event: Event) {
    this.listeners.forEach((listener) => listener(event));
  }
}
