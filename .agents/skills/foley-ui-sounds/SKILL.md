---
name: foley-ui-sounds
description: Add or update selected Foley sound feedback in TemplateV4 Angular features, including outcome cues and the theme drawer mute preference. Use when a feature needs audible feedback or changes an existing sound path; skip ordinary styling and navigation changes.
---

# Foley interface feedback

Read [the integration guide](../../../documentation/docs/ui-sounds.md) and the affected feature. The implementation lives in [UiSounds](../../../src/TemplateV4.Angular/src/app/core/ui-sounds.ts); [Notifications](../../../src/TemplateV4.Angular/src/app/features/notifications/notifications.ts) already supplies success/error sounds for toasts.

Choose sounds for meaningful accepted outcomes. Use existing toast methods when applicable; never add another cue to a path that already toasts, including HTTP failures handled by the interceptor. For other selected outcomes, inject `UiSounds` and call `play('complete')` after successful completion, `play('ping')` for a new notification, or `play(enabled ? 'on' : 'off')` after an accepted toggle change. Keep page loads, state restoration, hover, typing, ordinary clicks and navigation silent unless the user explicitly changes this scope.

Route all playback through `UiSounds`; do not import Foley in features or add `data-foley-*` attributes. The service intentionally does not call `bind()`: it owns trusted gesture activation, mute, visible-page/running-context checks and playback failure isolation. Do not queue blocked cues or add custom throttling; Foley already supplies its cue cooldown and limiter.

Preserve the chosen defaults: enabled sound, built-in soft theme, volume 0.35, browser-local mute in the theme drawer, tab synchronization, and reset to enabled. Motion and sound preferences are independent. Keep visible status/error feedback and accessible announcements; sound must not be the only way to understand an event. New controls and text follow the Angular scoped guidance and both supported cultures.

For changes to central behavior, extend `tools/ui-sounds.test.mjs` with observable cases such as muted/blocked playback, discarded stale events, or initial notification silence. Run that browser-free suite and affected Angular lint/format/build checks. Follow root policy for browser/E2E permission. Update the integration guide and ADR when changing the shared convention; use the installed Foley types/source as the API reference rather than copying upstream examples blindly.
