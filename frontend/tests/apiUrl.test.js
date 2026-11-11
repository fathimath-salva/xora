import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeApiBaseUrl, resolveApiAssetUrl } from '../src/utils/apiUrl.js';

test('defaults the API base to the local relative API path', () => {
  assert.equal(normalizeApiBaseUrl(''), '/api');
  assert.equal(normalizeApiBaseUrl(undefined), '/api');
});

test('normalizes a configured API base URL', () => {
  assert.equal(normalizeApiBaseUrl(' https://api.example.com/api/ '), 'https://api.example.com/api');
});

test('resolves uploaded media against the configured backend origin', () => {
  assert.equal(
    resolveApiAssetUrl('/uploads/product.jpg', 'https://api.example.com/api'),
    'https://api.example.com/uploads/product.jpg'
  );
});

test('keeps local uploaded media and storefront images same-origin', () => {
  assert.equal(resolveApiAssetUrl('/uploads/product.jpg', '/api'), '/uploads/product.jpg');
  assert.equal(resolveApiAssetUrl('/images/product.jpg', 'https://api.example.com/api'), '/images/product.jpg');
});
