import test from 'node:test';
import assert from 'node:assert/strict';
import { hashPassword, verifyPassword } from '../src/utils/password.js';

test('password hashes verify only the original password', async () => {
  const hash = await hashPassword('A-long-test-password-2026!');
  assert.notEqual(hash, 'A-long-test-password-2026!');
  assert.equal(await verifyPassword('A-long-test-password-2026!', hash), true);
  assert.equal(await verifyPassword('incorrect-password', hash), false);
});
