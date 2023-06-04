import { useCallback, useEffect, useRef } from 'react';

export const useMutationObserver = (
  target: Element | null,
  options: MutationObserverInit,
  callback: MutationCallback
) => {
  const observer = useRef<MutationObserver | null>(null);

  const disconnect = useCallback(() => {
    if (!observer.current) {
      return;
    }

    observer.current.disconnect();
    observer.current = null;
  }, []);

  useEffect(() => {
    if (!target) {
      return;
    }

    observer.current = new MutationObserver(callback);
    observer.current?.observe(target, options);

    return disconnect;
  }, [callback, disconnect, options, target]);

  return disconnect;
};
