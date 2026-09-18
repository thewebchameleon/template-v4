# Interface sounds

The Angular app uses [Foley](https://usefoley.dev/) for selected feedback: successful actions, displayed errors, and increases in unread notifications after the first successful summary. Sounds are enabled by default, using the built-in `soft` theme at volume `0.35`. Existing notifications on sign-in, unchanged counts, navigation, typing and ordinary clicks are silent.

**Mute interface sounds** lives in **Accessibility Settings**. It is browser-local, synchronizes across tabs, and resets to enabled through **Reset all settings**. It is independent of motion preferences. Sound supplements visible feedback and never replaces accessible labels or status announcements.

## Adding feedback to a feature

Successful password, MFA and passkey sign-in play one `success` cue from the login page's shared completion method. Pending challenges, failed or cancelled sign-in, and automatic session restoration do not play this cue. The browser-local mute setting still applies.

Use the shared `Notifications.success(key)` and `Notifications.error(problem)` methods for toast feedback; they already play their corresponding cue. Do not add a second sound to those paths. The error interceptor owns ordinary HTTP error toasts, so avoid repeating feedback in feature catch handlers.

For a selected event without an existing toast, inject `UiSounds` from `src/TemplateV4.Angular/src/app/core/ui-sounds.ts` and call `sounds.play('complete')` after the operation succeeds. The allowed cues are `success`, `error`, `ping`, `on`, `off`, and `complete`. Use `on`/`off` only after a deliberate toggle change is accepted, not when restoring state. Keep cue selection and loudness consistent; new global sound conventions belong in the service and [ADR 0030](adr/0030-interface-sounds.md).

The service initializes once through the app initializer, restores mute before audio activation, and unlocks Web Audio on trusted pointer/keyboard gestures. Programmatic playback requires a running audio context and a visible page: early, hidden, muted or suspended cues are discarded instead of queued. Browsers still control audio permission. Unsupported audio and blocked local storage leave the interface usable.

Do not call Foley directly from features or add `data-foley-*` attributes. The integration intentionally uses programmatic cues, not Foley's delegated `bind()`, so all playback passes through the shared safeguards. No audio assets, CDN scripts, backend settings or CSP changes are needed.

The repository skill is `.agents/skills/foley-ui-sounds/SKILL.md`. Run `node --test tools/ui-sounds.test.mjs` for browser-free behavioral checks, plus Angular formatting, lint and build checks. Browser audio, keyboard and visual checks require the repository's explicit E2E permission.
