/** Pace visible progress without reporting completion before the real request succeeds. */
export async function simulateSlowUpload(
  upload: (progress: (value: number) => void) => Promise<void>,
  progress: (value: number) => void,
  signal?: AbortSignal,
) {
  signal?.throwIfAborted();
  const duration = 4000 + Math.random() * 6000;
  const started = performance.now();
  let actual = 0;
  let timer: ReturnType<typeof setInterval> | undefined;
  let abort!: () => void;
  const cancelled = new Promise<never>((_, reject) => {
    abort = () => reject(signal?.reason);
    signal?.addEventListener('abort', abort, { once: true });
  });
  const elapsed = new Promise<void>((resolve) => {
    timer = setInterval(() => {
      const fraction = Math.min(1, (performance.now() - started) / duration);
      progress(Math.min(99, actual, Math.floor(fraction * 100)));
      if (fraction === 1) {
        clearInterval(timer);
        resolve();
      }
    }, 50);
  });
  try {
    await Promise.race([
      cancelled,
      Promise.all([
        upload((value) => {
          actual = value;
        }).then(() => {
          actual = 100;
        }),
        elapsed,
      ]),
    ]);
    signal?.throwIfAborted();
    progress(100);
  } finally {
    clearInterval(timer);
    signal?.removeEventListener('abort', abort);
  }
}
