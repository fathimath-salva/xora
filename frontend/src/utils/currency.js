const INR_PER_CATALOG_UNIT = 83;

export const catalogUnitsToRupees = (amount) => Math.round((Number(amount) || 0) * INR_PER_CATALOG_UNIT);

export const formatInr = (amount) => `₹${catalogUnitsToRupees(amount).toLocaleString('en-IN')}`;

export const rupeesToCatalogUnits = (rupees) => (Number(rupees) || 0) / INR_PER_CATALOG_UNIT;