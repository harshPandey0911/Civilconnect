require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('./models/Category');

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  const cats = await Category.find({ title: { $regex: /civil/i } }).lean();
  console.log(JSON.stringify(cats.map(c => ({ title: c.title, status: c.status, showOnHome: c.showOnHome, cityIds: c.cityIds })), null, 2));
  process.exit(0);
}

check();
