import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const manifestPath = fileURLToPath(new URL('../../frontend/public/images/dev-products/manifest.json', import.meta.url));
const assetDirectory = path.dirname(manifestPath);

test('the dummy catalogue image manifest covers 24 unique verified local photos', () => {
  assert.ok(existsSync(manifestPath), 'the dummy image source manifest must exist');
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  assert.equal(manifest.length, 24);

  const slugs = new Set();
  for (const entry of manifest) {
    assert.match(entry.productSlug, /^dev-dummy-/);
    assert.equal(slugs.has(entry.productSlug), false);
    slugs.add(entry.productSlug);
    assert.ok(entry.file);
    assert.match(entry.sourceUrl, /^https:\/\/www\.pexels\.com\/photo\//);
    assert.ok(entry.creator?.trim());
    assert.equal(entry.license, 'Pexels License');
    assert.equal(entry.licenseUrl, 'https://www.pexels.com/license/');
    assert.match(entry.retrievedAt, /^\d{4}-\d{2}-\d{2}$/);

    const bytes = readFileSync(path.join(assetDirectory, entry.file));
    const sha256 = createHash('sha256').update(bytes).digest('hex');
    assert.equal(entry.sha256, sha256, `${entry.file} hash does not match`);
  }
});
