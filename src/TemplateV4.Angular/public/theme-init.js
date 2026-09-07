// Runs before styles and Angular, without relaxing the production script CSP.
(() => {
  let preference = 'system';
  let uiPreferences = {};
  try {
    const stored = localStorage.getItem('templatev4-theme');
    if (stored === 'light' || stored === 'dark') preference = stored;
    const parsedUiPreferences = JSON.parse(
      localStorage.getItem('templatev4-ui-preferences') || '{}',
    );
    if (parsedUiPreferences && typeof parsedUiPreferences === 'object') {
      uiPreferences = parsedUiPreferences;
    }
    const culture = localStorage.getItem('templatev4-culture');
    if (culture === 'en-ZA' || culture === 'af-ZA') document.documentElement.lang = culture;
  } catch {
    // Storage can be unavailable; the device preference still works.
  }
  document.documentElement.dataset['themePreference'] = preference;
  document.documentElement.dataset['textSize'] =
    uiPreferences.textSize === 'large' || uiPreferences.textSize === 'extra-large'
      ? uiPreferences.textSize
      : 'default';
  document.documentElement.dataset['contrast'] =
    uiPreferences.contrast === 'high' ? 'high' : 'standard';
  document.documentElement.dataset['motion'] =
    uiPreferences.motion === 'reduced' ? 'reduced' : 'system';
  document.documentElement.dataset['density'] =
    uiPreferences.density === 'compact' ? 'compact' : 'comfortable';
  document.documentElement.classList.toggle(
    'dark',
    preference === 'dark' ||
      (preference === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches),
  );
})();
