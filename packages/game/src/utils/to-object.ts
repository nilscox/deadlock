export const toObject = <T, K extends PropertyKey, V>(
  array: T[],
  getKey: (item: T) => K,
  getValue: (item: T) => V
): Record<K, V> => {
  return array.reduce(
    (obj, item) => ({
      ...obj,
      [getKey(item)]: getValue(item),
    }),
    {} as Record<K, V>
  );
};
