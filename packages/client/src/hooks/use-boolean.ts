import { useState, useCallback } from 'react';

export const useBoolean = (initialValue: boolean) => {
  const [value, setValue] = useState(initialValue);

  return [
    //
    value,
    useCallback(() => setValue(true), []),
    useCallback(() => setValue(false), []),
  ] as const;
};
