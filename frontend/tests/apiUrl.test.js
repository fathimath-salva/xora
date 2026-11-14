import fs from 'node:fs';
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

test('vercel proxies API and upload requests to staging before the SPA fallback', () => {
  const config = JSON.parse(fs.readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'));
  const apiRewrite = config.rewrites.find((rule) => rule.source === '/api/:path*');
  const uploadsRewrite = config.rewrites.find((rule) => rule.source === '/uploads/:path*');
  const fallbackIndex = config.rewrites.findIndex((rule) => rule.source === '/(.*)');

  assert.ok(apiRewrite, 'Expected /api rewrite to exist.');
  assert.equal(
    apiRewrite.destination,
    'https://yaqana-men-s-fashion-development.onrender.com/api/:path*'
  );
  assert.ok(uploadsRewrite, 'Expected /uploads rewrite to exist.');
  assert.equal(
    uploadsRewrite.destination,
    'https://yaqana-men-s-fashion-development.onrender.com/uploads/:path*'
  );
  assert.ok(fallbackIndex > -1, 'Expected SPA fallback rewrite to exist.');
  assert.ok(config.rewrites.indexOf(apiRewrite) < fallbackIndex, 'Expected API rewrite before SPA fallback.');
  assert.ok(config.rewrites.indexOf(uploadsRewrite) < fallbackIndex, 'Expected uploads rewrite before SPA fallback.');
});
