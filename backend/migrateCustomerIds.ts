import mongoose from 'mongoose';
import User from './src/models/User.js';

// Helper function to generate unique customer ID
function generateCustomerId(): string {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const randomNum = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  return `${year}${month}${randomNum}`;
}

async function migrateCustomerIds() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/plants-mall';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Find all users without customerId
    const usersWithoutId = await User.find({ customerId: { $exists: false } });
    console.log(`Found ${usersWithoutId.length} users without customerId`);

    if (usersWithoutId.length === 0) {
      console.log('All users already have customerId');
      await mongoose.connection.close();
      return;
    }

    // Generate customerId for each user
    for (const user of usersWithoutId) {
      user.customerId = generateCustomerId();
      await user.save();
      console.log(`Generated customerId ${user.customerId} for user ${user.email}`);
    }

    console.log(`Migration completed! Generated ${usersWithoutId.length} customer IDs`);
    await mongoose.connection.close();
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrateCustomerIds();
