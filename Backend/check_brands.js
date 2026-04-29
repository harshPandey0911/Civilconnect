require('dotenv').config();
const mongoose = require('mongoose');
const Brand = require('./models/Brand');

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  const brands = await Brand.find({}).lean();
  console.log(`Found ${brands.length} brands`);
  console.log(JSON.stringify(brands.map(b => ({ title: b.title, vendorId: b.vendorId, categoryId: b.categoryId })), null, 2));
  process.exit(0);
}

check();
