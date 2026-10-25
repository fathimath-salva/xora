import test from 'node:test';
import assert from 'node:assert/strict';
import { categoriesData, productsData } from '../src/utils/seedData.js';
import { createDryRunReport, toProductApiPayload } from '../scripts/importCatalogueViaAdminApi.js';

test('API import dry run plans the four categories and 20 products without existing data', () => {
  const report = createDryRunReport({ existingCategories: [], existingProducts: [] });
  assert.equal(report.apiDestination, 'https://xora-backend-u7fd.onrender.com/api');
  assert.equal(report.categoriesToCreate.length, 4);
  assert.equal(report.productsToCreate.length, 20);
  assert.deepEqual(report.validationErrors, []);
});

test('API payload preserves catalogue data and converts INR exactly once', () => {
  const source = productsData[0];
  const payload = toProductApiPayload(source);
  assert.equal(payload.price, source.priceInr / 83);
  assert.equal(payload.discountPrice, null);
  assert.equal(payload.collection, source.collectionName);
  assert.deepEqual(payload.colours, source.colours);
  assert.equal(Object.hasOwn(payload, 'priceInr'), false);
  assert.equal(categoriesData.length, 4);
});
