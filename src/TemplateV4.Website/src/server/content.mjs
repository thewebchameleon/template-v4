// Cache public CMS responses and confirmed removals. Control state is never cached.
export function createCmsCache(limit = 100) {
  const values = new Map();
  let generation = 0;
  const remember = (key, value, started) => {
    if (started !== generation) return;
    values.delete(key);
    values.set(key, value);
    while (values.size > limit) values.delete(values.keys().next().value);
  };
  return {
    clear() {
      values.clear();
      generation++;
    },
    async read(key, fallback, fetcher) {
      const started = generation;
      try {
        const response = await fetcher();
        if (response.status === 404) {
          remember(key, null, started);
          return null;
        }
        if (!response.ok) throw new Error("CMS unavailable");
        const value = await response.json();
        remember(key, value, started);
        return value;
      } catch {
        return values.has(key) ? values.get(key) : fallback;
      }
    },
  };
}
export const samplePosts = [
  {
    title: "A clearer plan for your next chapter",
    slug: "a-clearer-plan",
    excerpt:
      "Start with the right questions, a shared direction and practical next steps.",
    author: "The team",
    publishedAt: "2026-01-15T00:00:00Z",
    updatedAt: "2026-01-15T00:00:00Z",
  },
  {
    title: "Making good work happen together",
    slug: "working-together",
    excerpt: "Why listening, clear communication and steady progress matter.",
    author: "The team",
    publishedAt: "2026-01-10T00:00:00Z",
    updatedAt: "2026-01-10T00:00:00Z",
  },
];
export const sampleArticle = (slug) => {
  const summary = samplePosts.find((x) => x.slug === slug);
  return summary
    ? {
        summary,
        html: "<p>Every worthwhile project begins with a conversation. Take time to understand what matters, agree on a direction, and turn that direction into manageable steps.</p><h2>Start with what matters</h2><p>Listen to the people closest to the work. Define the outcome together and make room for questions along the way.</p><h2>Build momentum</h2><p>Keep your next step practical. Review progress regularly and use what you learn to improve the plan.</p>",
      }
    : null;
};
