// Runs before styles and Angular, without relaxing the production script CSP.
(() => {
  let preference = 'system';
  try {
    const stored = localStorage.getItem('templatev4-theme');
    if (stored === 'light' || stored === 'dark') preference = stored;
  } catch {
    // Storage can be unavailable; the device preference still works.
  }
  document.documentElement.dataset['themePreference'] = preference;
  document.documentElement.classList.toggle(
    'dark',
    preference === 'dark' ||
      (preference === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches),
  );
})();
