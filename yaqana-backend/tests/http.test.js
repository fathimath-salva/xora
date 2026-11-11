import test from 'node:test';
import assert from 'node:assert/strict';
import { slugify, httpError } from '../src/utils/http.js';

test('slugify creates stable URL-safe slugs', () => {
  assert.equal(slugify('  Premium Linen Shirts  '), 'premium-linen-shirts');
});

test('httpError carries a safe status and machine code', () => {
  const error = httpError(409, 'Conflict', 'CONFLICT');
  assert.equal(error.statusCode, 409);
  assert.equal(error.code, 'CONFLICT');
});
