export function buildEffectivePriceFilter(minPricePaise, maxPricePaise) {
  const effectivePrice = { $ifNull: ['$discountPricePaise', '$pricePaise'] };
  const conditions = [];

  if (minPricePaise !== undefined) conditions.push({ $gte: [effectivePrice, minPricePaise] });
  if (maxPricePaise !== undefined) conditions.push({ $lte: [effectivePrice, maxPricePaise] });

  if (!conditions.length) return undefined;
  return { $expr: conditions.length === 1 ? conditions[0] : { $and: conditions } };
}
