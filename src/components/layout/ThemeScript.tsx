'use client';

import { useServerInsertedHTML } from 'next/navigation';
import { useRef } from 'react';

// Runs before first paint so a saved light theme never flashes dark.
// Without a saved choice, the theme the admin set under Brand applies; <html data-default-theme> carries it.
const THEME_SCRIPT = `var d=document.documentElement.dataset.defaultTheme==='light'?'light':'dark';try{var t=localStorage.getItem('theme');if(t!=='light'&&t!=='dark')t=d;document.documentElement.dataset.theme=t;var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute('content',t==='light'?'#ffffff':'#050507')}catch(e){document.documentElement.dataset.theme=d}`;

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
