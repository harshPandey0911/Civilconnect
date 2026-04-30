require('dotenv').config();
const mongoose = require('mongoose');

// Define Schema locally if needed, but better to import
const SubscriptionPlanSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  duration: { type: Number, required: true },
  description: { type: String },
  features: [{ type: String }],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const SubscriptionPlan = mongoose.models.SubscriptionPlan || mongoose.model('SubscriptionPlan', SubscriptionPlanSchema);

async function seed() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/civilconnect');
    
    console.log('Clearing existing plans...');
    await SubscriptionPlan.deleteMany({});

    const plans = [
      {
        name: "Bronze Starter",
        price: 499,
        duration: 30,
        description: "Perfect for new vendors starting their journey.",
        features: ["Standard Listing", "5 Leads per Month", "Email Support"],
        isActive: true
      },
      {
        name: "Silver Growth",
        price: 999,
        duration: 30,
        description: "Boost your business with more visibility and leads.",
        features: ["Featured Listing", "20 Leads per Month", "Priority Email Support", "Dashboard Analytics"],
        isActive: true
      },
      {
        name: "Gold Professional",
        price: 1999,
        duration: 30,
        description: "Maximum exposure and unlimited potential.",
        features: ["Premium Top-of-List Placement", "Unlimited Leads", "24/7 Phone Support", "Advanced Analytics", "Verification Badge"],
        isActive: true
      }
    ];

    console.log('Inserting new plans...');
    await SubscriptionPlan.insertMany(plans);
    
    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seed();
