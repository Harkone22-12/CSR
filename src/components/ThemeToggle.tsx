import { useEffect, useState } from 'react';

const root = document.documentElement;
const media = window.matchMedia('(prefers-color-scheme: dark)');
const currentTheme = () => root.dataset.theme || (media.matches ? 'dark' : 'light');

// Day/night switch. index.html applies the saved theme before React starts.
export default function ThemeToggle() {
  const [theme, setTheme] = useState(currentTheme);

  // Follow the OS setting when the user has not picked a theme.
  useEffect(() => {
    const sync = () => setTheme(currentTheme());
    media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, []);

  const toggle = () => {
    const next = currentTheme() === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    try { localStorage.setItem('up-theme', next); } catch { /* storage blocked */ }
    setTheme(next);
  };

  const dark = theme === 'dark';
  return (
    <button
      className="icon-btn"
      type="button"
      onClick={toggle}
      aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}
    >
      <i className={`ph ${dark ? 'ph-sun' : 'ph-moon'}`} aria-hidden="true" />
    </button>
  );
}
