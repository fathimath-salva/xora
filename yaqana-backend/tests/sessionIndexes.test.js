import test from 'node:test';
import assert from 'node:assert/strict';
import Session from '../src/models/Session.js';

test('session expiry uses a single TTL index', () => {
  const expiryIndexes = Session.schema.indexes().filter(([keys]) => keys.expiresAt === 1);
  assert.equal(expiryIndexes.length, 1);
  assert.equal(expiryIndexes[0][1].expireAfterSeconds, 0);
});
