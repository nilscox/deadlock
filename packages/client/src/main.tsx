import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Suspense } from 'react';
import * as ReactDOM from 'react-dom/client';

import { App } from './app';
import { InitThemeMode } from './hooks/use-theme-mode';
import { IntlProvider } from './intl/intl-provider';

import './styles.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnMount: false,
      throwOnError: true,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <QueryClientProvider client={queryClient}>
    {import.meta.env.DEV && <ReactQueryDevtools />}
    <Suspense fallback={null}>
      <IntlProvider>
        <InitThemeMode />
        <App />
      </IntlProvider>
    </Suspense>
  </QueryClientProvider>
);

if ('serviceWorker' in navigator) {
  void navigator.serviceWorker.register('/service-worker.js');
}
