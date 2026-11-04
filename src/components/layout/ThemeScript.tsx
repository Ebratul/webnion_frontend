'use client';

import { useServerInsertedHTML } from 'next/navigation';
import { useRef } from 'react';

// Runs before first paint so a saved light theme never flashes dark.
const THEME_SCRIPT = `try{var t=localStorage.getItem('theme');if(t!=='light'&&t!=='dark')t='dark';document.documentElement.dataset.theme=t;var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute('content',t==='light'?'#ffffff':'#050507')}catch(e){document.documentElement.dataset.theme='dark'}`;

// Switching language remounts <html> on the client, where React warns about any rendered <script>.
// This adds the script to the server HTML only; ThemeToggle restores the theme after a client remount.
export const ThemeScript = () => {
  const inserted = useRef(false);

  useServerInsertedHTML(() => {
    if (inserted.current) return null;
    inserted.current = true;
    return <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />;
  });

  return null;
};
