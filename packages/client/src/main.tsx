import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Suspense } from 'react';
import * as ReactDOM from 'react-dom/client';

import { App } from './app';

import './styles.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      suspense: true,
      retry: false,
      refetchOnMount: false,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <QueryClientProvider client={queryClient}>
    <ReactQueryDevtools />
    <Suspense fallback={null}>
      <App />
    </Suspense>
  </QueryClientProvider>
);

if ('serviceWorker' in navigator) {
  void navigator.serviceWorker.register('/service-worker.js');
}

void document.querySelector('audio')?.play();
