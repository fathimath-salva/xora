import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import { categoriesData, productsData } from './seedData.js';

dotenv.config();

const INR_PER_CATALOG_UNIT = 83;

const toCatalogUnits = (rupees) => Number((rupees / INR_PER_CATALOG_UNIT).toFixed(4));
const toSlug = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const seed = async () => {
  try {
    await connectDB();

    const categories = categoriesData.filter((category) => category.gender !== 'women');
    await Category.bulkWrite(categories.map((category) => ({
      updateOne: {
        filter: { slug: category.slug },
        update: { $setOnInsert: category },
        upsert: true
      }
    })));

    const menProducts = productsData
      .filter((product) => product.gender === 'men')
      .map(({ priceInr, discountPriceInr, ...product }) => ({
        ...product,
        slug: toSlug(product.name),
        price: toCatalogUnits(priceInr),
        discountPrice: discountPriceInr === null ? null : toCatalogUnits(discountPriceInr)
      }));

    await Product.bulkWrite(menProducts.map((product) => {
      const { stock, ...catalogFields } = product;
      return {
        updateOne: {
          filter: { name: product.name, gender: 'men' },
          update: {
            $set: catalogFields,
            $setOnInsert: { stock }
          },
          upsert: true
        }
      };
    }));

    console.log(`[Seeder] Catalog upsert complete: ${categories.length} categories, ${menProducts.length} men's products.`);
    console.log('[Seeder] Existing users, orders, carts, wishlists, addresses, and product stock were preserved.');
  } catch (error) {
    console.error(`[Seeder Error]: ${error.message}`);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

seed();
