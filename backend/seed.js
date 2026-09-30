const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

const User = require('./models/User');
const Category = require('./models/Category');
const Listing = require('./models/Listing');
const Conversation = require('./models/Conversation');
const Message = require('./models/Message');

const connectDB = require('./config/db');

const seedData = async () => {
  try {
    const conn = await connectDB(false);
    if (!conn || mongoose.connection.readyState !== 1) {
      throw new Error('Could not connect to MongoDB. Ensure MongoDB is running.');
    }

    console.log('Clearing old collections...');
    await User.deleteMany({});
    await Category.deleteMany({});
    await Listing.deleteMany({});
    await Conversation.deleteMany({});
    await Message.deleteMany({});

    console.log('Seeding Users...');
    const salt = await bcrypt.genSalt(10);
    const adminPassword = await bcrypt.hash('admin12345', salt);
    const userPassword = await bcrypt.hash('user12345', salt);

    await User.create([
      {
        name: 'System Admin Moderator',
        email: 'admin@olx.in',
        password: adminPassword,
        phone: '+91 98000 11223',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
        isAdmin: true,
        status: 'active'
      },
      {
        name: 'Rahul Varma',
        email: 'rahul.varma@gmail.com',
        password: userPassword,
        phone: '+91 98765 43210',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
        isAdmin: false,
        status: 'active'
      }
    ]);

    console.log('Seeding Categories...');
    const defaultCategories = [
      {
        id: 'cat-cars',
        name: 'Cars',
        slug: 'cars',
        iconName: 'Car',
        subcategories: [
          { id: 'sub-cars-used', name: 'Used Cars', slug: 'used-cars' },
          { id: 'sub-cars-parts', name: 'Spare Parts & Accessories', slug: 'spare-parts' }
        ]
      },
      {
        id: 'cat-properties',
        name: 'Properties',
        slug: 'properties',
        iconName: 'Home',
        subcategories: [
          { id: 'sub-prop-sale', name: 'For Sale: Houses & Apartments', slug: 'houses-for-sale' },
          { id: 'sub-prop-rent', name: 'For Rent: Houses & Apartments', slug: 'houses-for-rent' }
        ]
      },
      {
        id: 'cat-mobiles',
        name: 'Mobiles',
        slug: 'mobiles',
        iconName: 'Smartphone',
        subcategories: [
          { id: 'sub-mobile-phones', name: 'Mobile Phones', slug: 'mobile-phones' },
          { id: 'sub-mobile-accessories', name: 'Accessories', slug: 'mobile-accessories' }
        ]
      },
      {
        id: 'cat-bikes',
        name: 'Bikes',
        slug: 'bikes',
        iconName: 'Bike',
        subcategories: [
          { id: 'sub-bike-motorcycles', name: 'Motorcycles', slug: 'motorcycles' },
          { id: 'sub-bike-scooters', name: 'Scooters', slug: 'scooters' }
        ]
      },
      {
        id: 'cat-electronics',
        name: 'Electronics & Appliances',
        slug: 'electronics',
        iconName: 'Tv',
        subcategories: [
          { id: 'sub-elec-tv', name: 'TVs & Audio', slug: 'tvs-audio' },
          { id: 'sub-elec-laptops', name: 'Laptops', slug: 'laptops' }
        ]
      }
    ];
    await Category.insertMany(defaultCategories);

    console.log('✅ Database setup complete! Categories and demo accounts are ready. No dummy listings inserted.');
    process.exit(0);
  } catch (error) {
    console.error(`Error initializing database: ${error.message}`);
    process.exit(1);
  }
};

seedData();
