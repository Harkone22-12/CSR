// A tiny hash router (no library).
//
// The part after "#" in the URL never goes to the server, so changing it
// does not reload the page. We listen for "hashchange" and let React
// render a different screen. Examples:
//   #/students?q=elena    -> list screen with a text filter
//   #/students/new        -> list screen, cursor in the add form
//   #/students/edit/ID    -> edit screen
import { useEffect, useState } from 'react';

export interface Route {
  path: string;              // e.g. "/students/edit/STU-2024-101"
  query: URLSearchParams;    // e.g. q=elena&major=Economics
  flash: string | null;      // success message passed by navigate()
}

// Message waiting to be shown on the next screen (like ?success= in the EJS version).
let pendingFlash: string | null = null;
const listeners = new Set<() => void>();

function readRoute(): Route {
  const raw = window.location.hash.replace(/^#/, '') || '/students';
  const [path, qs = ''] = raw.split('?');
  const flash = pendingFlash;
  pendingFlash = null;
  return { path: path === '/' ? '/students' : path, query: new URLSearchParams(qs), flash };
}

// Browsers may or may not percent-encode the hash, so compare decoded forms.
function sameUrl(a: string, b: string) {
  try {
    return decodeURI(a) === decodeURI(b);
  } catch {
    return a === b;
  }
}

/** Go to another screen. Same URL is fine too: the screen re-renders and reloads its data. */
export function navigate(to: string, flash?: string) {
  pendingFlash = flash ?? null;
  if (sameUrl(window.location.hash, '#' + to)) {
    listeners.forEach((fn) => fn());
  } else {
    window.location.hash = to;
  }
}

/** Current route. Only <App> calls this; pages get the route as a prop. */
export function useRoute(): Route {
  const [route, setRoute] = useState<Route>(readRoute);
  useEffect(() => {
    const update = () => setRoute(readRoute());
    listeners.add(update);
    window.addEventListener('hashchange', update);
    return () => {
      listeners.delete(update);
      window.removeEventListener('hashchange', update);
    };
  }, []);
  return route;
}

/** matchPath('/students/edit/:id', '/students/edit/STU-1') -> { id: 'STU-1' } */
export function matchPath(pattern: string, path: string): Record<string, string> | null {
  const a = pattern.split('/');
  const b = path.split('/');
  if (a.length !== b.length) return null;
  const params: Record<string, string> = {};
  for (let i = 0; i < a.length; i++) {
    if (a[i].startsWith(':')) params[a[i].slice(1)] = decodeURIComponent(b[i]);
    else if (a[i] !== b[i]) return null;
  }
  return params;
}
