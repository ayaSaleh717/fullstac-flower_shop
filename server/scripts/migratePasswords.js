import mongoose from 'mongoose';
import User from '../models/users.model.js';
import dotenv from 'dotenv';

dotenv.config();

const migratePasswords = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.DATABASE_URI);
    console.log('Connected to MongoDB');

    // Find all users with passwrd field
    const users = await User.find({ passwrd: { $exists: true } });
    console.log(`Found ${users.length} users to migrate`);

    // Update each user
    for (const user of users) {
      if (user.passwrd) {
        console.log(`Migrating user: ${user.email}`);
        user.password = user.passwrd;
        user.passwrd = undefined; // Keep the field but set to undefined
        await user.save();
        console.log(`Migrated user: ${user.email}`);
      }
    }

    console.log('Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

migratePasswords();
