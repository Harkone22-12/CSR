// Entry point of the client bundle. This is where client-side rendering starts:
// React takes the empty <div id="root"> from index.html and draws the app into it.
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
