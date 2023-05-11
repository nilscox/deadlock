import * as ReactDOM from 'react-dom/client';

import { App } from './app';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(<App />);

if ('serviceWorker' in navigator) {
  void navigator.serviceWorker.register('/service-worker.js');
}
