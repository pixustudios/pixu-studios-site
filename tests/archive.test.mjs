import test from 'node:test';
import assert from 'node:assert/strict';
import { mixArchiveEvents } from '../lib/archive.ts';

test('archive shuffle separates events horizontally and vertically without duplicates', () => {
  const images = [6, 6, 5, 4, 2, 1, 1].flatMap((count, event) => Array.from({ length: count }, (_, i) => ({ src: `${event}-${i}`, event: String(event) })));
  for (let run = 0; run < 50; run++) {
    const mixed = mixArchiveEvents(images);
    assert.equal(new Set(mixed.map(image => image.src)).size, images.length);
    mixed.forEach((image, i) => {
      if (i > 0) assert.notEqual(image.event, mixed[i - 1].event);
      if (i > 1) assert.notEqual(image.event, mixed[i - 2].event);
    });
  }
});
test('unavoidable event clusters keep every photo exactly once', () => {
  const images = Array.from({ length: 4 }, (_, i) => ({ src: String(i), event: 'same' }));
  assert.equal(new Set(mixArchiveEvents(images).map(image => image.src)).size, 4);
  assert.deepEqual(mixArchiveEvents([]), []);
});
