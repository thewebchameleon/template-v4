# ADR 0030: Selected interface sounds with Foley

Status: Accepted

Use `@foleyjs/core` behind a root Angular `UiSounds` service for selected outcome feedback. The application initializer establishes the service before runtime requests. The built-in soft theme at volume 0.35 provides a consistent starting sound set without assets or extra network origins.

Sound is enabled by default. A localized Spartan switch in the theme drawer persists a browser-local mute preference, synchronizes across tabs and participates in Reset all settings. This setting is independent of visual motion preferences and account notification-delivery settings.

Shared toast methods own success/error cues. Unread summaries sound only for an accepted count increase after establishing a baseline for the current actor; stale responses and initial loads remain silent. Features may request selected completion or accepted toggle cues through the service, without duplicating existing toast feedback.

The service uses programmatic Foley calls and trusted gesture activation instead of global declarative binding. It discards cues while muted, hidden or without a running audio context, and catches playback failures. This avoids replaying stale feedback after an autoplay restriction. Audio remains supplementary to visible, accessible feedback. No backend or generated API contract changes are required.

See [Interface sounds](../ui-sounds.md) for extension and validation guidance.
