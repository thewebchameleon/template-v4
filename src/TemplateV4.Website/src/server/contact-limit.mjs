export function contactLimiter(now = Date.now) {
  const buckets = new Map();
  return (key) => {
    const time = now();
    for (const [id, bucket] of buckets)
      if (bucket.until <= time) buckets.delete(id);
    let bucket = buckets.get(key);
    if (!bucket) {
      if (buckets.size >= 10000) return false;
      bucket = { until: time + 600000, count: 0 };
      buckets.set(key, bucket);
    }
    return ++bucket.count <= 5;
  };
}
