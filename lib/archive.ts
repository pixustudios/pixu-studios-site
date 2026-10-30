export function mixArchiveEvents<T extends { event?: string; src: string }>(images: T[]): T[] {
  let best = [...images], bestScore = Infinity;
  const event = (image: T) => image.event || image.src;
  for (let attempt = 0; attempt < 100; attempt++) {
    const remaining = [...images], order: T[] = [];
    while (remaining.length) {
      const counts = new Map<string, number>();
      remaining.forEach(image => counts.set(event(image), (counts.get(event(image)) || 0) + 1));
      const ranked = remaining.map((image, index) => ({ index, score:
        (order.length > 0 && event(order[order.length - 1]) === event(image) ? 100 : 0) +
        (order.length > 1 && event(order[order.length - 2]) === event(image) ? 100 : 0) -
        (counts.get(event(image)) || 0) + Math.random() * 2,
      })).sort((a, b) => a.score - b.score);
      order.push(remaining.splice(ranked[0].index, 1)[0]);
    }
    const score = order.reduce((total, image, i) => total +
      (i > 0 && event(image) === event(order[i - 1]) ? 1 : 0) +
      (i > 1 && event(image) === event(order[i - 2]) ? 1 : 0), 0);
    if (score < bestScore) { best = order; bestScore = score; }
    if (score === 0) break;
  }
  return best;
}
