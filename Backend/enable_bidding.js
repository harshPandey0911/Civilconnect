require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('./models/Category');

async function enableBidding() {
  await mongoose.connect(process.env.MONGODB_URI);
  await Category.updateMany(
    { title: { $regex: /civil/i } },
    { $set: { isBiddingEnabled: true } }
  );
  console.log('Bidding enabled for Civil categories');
  process.exit(0);
}

enableBidding();
