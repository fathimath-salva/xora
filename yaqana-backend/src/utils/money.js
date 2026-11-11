import { env } from '../config/env.js';
export const PAISE_PER_CATALOG_UNIT = env.LEGACY_CURRENCY_FACTOR * 100;
export const catalogUnitsToPaise = (amount) => Math.round(Number(amount) * PAISE_PER_CATALOG_UNIT);
export const paiseToCatalogUnits = (paise) => Number(paise || 0) / PAISE_PER_CATALOG_UNIT;
export const rupeesToPaise = (rupees) => Math.round(Number(rupees) * 100);
export const paiseToRupees = (paise) => Number(paise || 0) / 100;
