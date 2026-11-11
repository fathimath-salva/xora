import test from 'node:test';
import assert from 'node:assert/strict';
import { buildEffectivePriceFilter } from '../src/utils/effectivePriceFilter.js';

const effectivePrice = { $ifNull: ['$discountPricePaise', '$pricePaise'] };

test('minimum price compares against the displayed sale price when present', () => {
  assert.deepEqual(buildEffectivePriceFilter(250000), {
    $expr: { $gte: [effectivePrice, 250000] }
  });
});

test('maximum price falls back to regular price when sale price is null', () => {
  assert.deepEqual(buildEffectivePriceFilter(undefined, 400000), {
    $expr: { $lte: [effectivePrice, 400000] }
  });
});

test('price range applies both bounds to the displayed price', () => {
  assert.deepEqual(buildEffectivePriceFilter(250000, 400000), {
    $expr: {
      $and: [
        { $gte: [effectivePrice, 250000] },
        { $lte: [effectivePrice, 400000] }
      ]
    }
  });
});

test('no price bounds leave the catalog query unrestricted by price', () => {
  assert.equal(buildEffectivePriceFilter(undefined, undefined), undefined);
});
