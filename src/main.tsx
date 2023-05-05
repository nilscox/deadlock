import ReactDOM from 'react-dom/client';

import { App } from './app';

import './styles.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(<App />);

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js');
}
