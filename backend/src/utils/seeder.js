import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Wishlist from '../models/Wishlist.js';
import Address from '../models/Address.js';
import { categoriesData, productsData } from './seedData.js';

dotenv.config();

const seed = async () => {
  try {
    await connectDB();

    console.log('[Seeder] Clearing existing data...');
    await Promise.all([
      User.deleteMany(),
      Product.deleteMany(),
      Category.deleteMany(),
      Order.deleteMany(),
      Cart.deleteMany(),
      Wishlist.deleteMany(),
      Address.deleteMany()
    ]);

    console.log('[Seeder] Creating users...');
    const adminUser = await User.create({
      name: 'XORA Director',
      email: 'admin@xora.com',
      password: 'admin123',
      role: 'admin',
      phone: '+1 (555) 019-2831'
    });

    const customerUser = await User.create({
      name: 'Eleanor Vance',
      email: 'customer@xora.com',
      password: 'password123',
      role: 'customer',
      phone: '+1 (555) 392-1084'
    });

    console.log('[Seeder] Creating categories...');
    await Category.insertMany(categoriesData);

    console.log('[Seeder] Creating products...');
    const createdProducts = await Product.insertMany(productsData);

    console.log('[Seeder] Creating default address for customer...');
    const defaultAddress = await Address.create({
      user: customerUser._id,
      fullName: customerUser.name,
      phone: customerUser.phone,
      addressLine1: '742 Evergreen Terrace',
      addressLine2: 'Apt 4B',
      city: 'New York',
      state: 'NY',
      postalCode: '10021',
      country: 'India',
      isDefault: true
    });

    console.log('[Seeder] Creating sample order...');
    const sampleProduct1 = createdProducts[0];
    const sampleProduct2 = createdProducts[1];

    await Order.create({
      customer: customerUser._id,
      items: [
        {
          product: sampleProduct1._id,
          name: sampleProduct1.name,
          image: sampleProduct1.images[0],
          price: sampleProduct1.discountPrice || sampleProduct1.price,
          quantity: 1,
          size: 'M',
          colour: 'Oatmeal Beige'
        },
        {
          product: sampleProduct2._id,
          name: sampleProduct2.name,
          image: sampleProduct2.images[0],
          price: sampleProduct2.price,
          quantity: 1,
          size: 'S',
          colour: 'Off-White'
        }
      ],
      shippingAddress: {
        fullName: defaultAddress.fullName,
        phone: defaultAddress.phone,
        addressLine1: defaultAddress.addressLine1,
        addressLine2: defaultAddress.addressLine2,
        city: defaultAddress.city,
        state: defaultAddress.state,
        postalCode: defaultAddress.postalCode,
        country: defaultAddress.country
      },
      paymentMethod: 'Test/Mock Online Payment',
      paymentStatus: 'Pending',
      orderStatus: 'Processing',
      subtotal: (sampleProduct1.discountPrice || sampleProduct1.price) + sampleProduct2.price,
      shippingFee: 0,
      tax: 54.40,
      total: (sampleProduct1.discountPrice || sampleProduct1.price) + sampleProduct2.price + 54.40,
      notes: 'Please leave with concierge if unavailable.'
    });

    console.log('----------------------------------------------------');
    console.log('✓ XORA database successfully seeded!');
    console.log('✓ Admin Account: admin@xora.com / admin123');
    console.log('✓ Demo Customer: customer@xora.com / password123');
    console.log(`✓ Products created: ${createdProducts.length}`);
    console.log('----------------------------------------------------');

    process.exit(0);
  } catch (error) {
    console.error(`[Seeder Error]: ${error.message}`);
    process.exit(1);
  }
};

seed();
