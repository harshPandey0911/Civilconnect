require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('./models/Category');

async function fix() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const result = await Category.updateMany(
      { 
        $or: [
          { homeIconUrl: null },
          { homeIconUrl: "" }
        ],
        imageUrl: { $ne: null }
      },
      [{ $set: { homeIconUrl: '$imageUrl' } }]
    );
    console.log(`Updated ${result.modifiedCount} categories`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

fix();
