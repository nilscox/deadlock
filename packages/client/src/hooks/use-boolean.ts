import { useCallback, useState } from 'react';

type Result<Value> = [
  //
  value: Value,
  setTrue: () => void,
  setFalse: () => void,
  toggle: () => void
];

export function useBoolean(): Result<boolean | undefined>;
export function useBoolean(initialValue: boolean): Result<boolean>;

export function useBoolean(initialValue?: boolean) {
  const [value, setValue] = useState(initialValue);

  return [
    value,
    useCallback(() => setValue(true), []),
    useCallback(() => setValue(false), []),
    useCallback(() => setValue((value) => !value), []),
  ];
}
