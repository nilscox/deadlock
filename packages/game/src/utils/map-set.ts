export class MapSet<K, T> extends Map<K, Set<T>> {
  add(key: K, value: T) {
    if (!this.has(key)) {
      this.set(key, new Set());
    }

    this.get(key)?.add(value);
  }
}
