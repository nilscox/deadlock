import { Suspense } from 'react';
import { createRoot } from 'react-dom/client';

import '@fontsource-variable/source-code-pro';
import 'modern-normalize/modern-normalize.css';
import './main.css';

import { App } from './app';
import { Providers } from './contexts';

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const container = document.getElementById('root')!;
const root = createRoot(container);

root.render(
  <Suspense fallback={<>Loading...</>}>
    <Providers>
      <App />
    </Providers>
  </Suspense>,
);
