const Category = require('../models/Category');

// @desc    Get all categories with subcategories
// @route   GET /api/categories
// @access  Public
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({}).sort({ createdAt: 1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Seed default OLX categories
// @route   POST /api/categories/seed
// @access  Public
const seedCategories = async (req, res) => {
  try {
    await Category.deleteMany({});

    const defaultCategories = [
      {
        id: 'cat-cars',
        name: 'Cars',
        slug: 'cars',
        iconName: 'Car',
        color: 'bg-emerald-50 text-emerald-800',
        subcategories: [
          { id: 'sub-cars-used', name: 'Used Cars', slug: 'used-cars' },
          { id: 'sub-cars-[#002f34]', name: 'Commercial & Other Vehicles', slug: 'commercial-vehicles' },
          { id: 'sub-cars-parts', name: 'Spare Parts & Accessories', slug: 'spare-parts' }
        ]
      },
      {
        id: 'cat-properties',
        name: 'Properties',
        slug: 'properties',
        iconName: 'Home',
        color: 'bg-indigo-50 text-indigo-800',
        subcategories: [
          { id: 'sub-prop-sale', name: 'For Sale: Houses & Apartments', slug: 'houses-for-sale' },
          { id: 'sub-prop-rent', name: 'For Rent: Houses & Apartments', slug: 'houses-for-rent' },
          { id: 'sub-prop-commercial', name: 'Commercial Spaces', slug: 'commercial-property' },
          { id: 'sub-prop-pg', name: 'PG & Guest Houses', slug: 'pg-guest-houses' }
        ]
      },
      {
        id: 'cat-[#002f34]s',
        name: 'Mobiles',
        slug: 'mobiles',
        iconName: 'Smartphone',
        color: 'bg-sky-50 text-sky-800',
        subcategories: [
          { id: 'sub-[#002f34]-phones', name: 'Mobile Phones', slug: 'mobile-phones' },
          { id: 'sub-[#002f34]-accessories', name: 'Accessories', slug: 'mobile-accessories' },
          { id: 'sub-[#002f34]-tablets', name: 'Tablets', slug: 'tablets' }
        ]
      },
      {
        id: 'cat-bikes',
        name: 'Bikes',
        slug: 'bikes',
        iconName: 'Bike',
        color: 'bg-amber-50 text-amber-800',
        subcategories: [
          { id: 'sub-bike-motorcycles', name: 'Motorcycles', slug: 'motorcycles' },
          { id: 'sub-bike-scooters', name: 'Scooters', slug: 'scooters' },
          { id: 'sub-bike-bicycles', name: 'Bicycles', slug: 'bicycles' }
        ]
      },
      {
        id: 'cat-electronics',
        name: 'Electronics & Appliances',
        slug: 'electronics',
        iconName: 'Tv',
        color: 'bg-purple-50 text-purple-800',
        subcategories: [
          { id: 'sub-elec-tv', name: 'TVs, Video & Audio', slug: 'tvs-audio' },
          { id: 'sub-elec-laptops', name: 'Laptops & Computers', slug: 'laptops-computers' },
          { id: 'sub-elec-fridge', name: 'Fridges & ACs', slug: 'fridges-acs' }
        ]
      },
      {
        id: 'cat-commercial',
        name: 'Commercial Vehicles & Spares',
        slug: 'commercial',
        iconName: 'Truck',
        color: 'bg-rose-50 text-rose-800',
        subcategories: [
          { id: 'sub-comm-trucks', name: 'Commercial Trucks & Vans', slug: 'trucks-vans' },
          { id: 'sub-comm-machinery', name: 'Industrial Machinery', slug: 'machinery' }
        ]
      },
      {
        id: 'cat-furniture',
        name: 'Furniture',
        slug: 'furniture',
        iconName: 'Armchair',
        color: 'bg-teal-50 text-teal-800',
        subcategories: [
          { id: 'sub-furn-sofa', name: 'Sofa & Dining Sets', slug: 'sofas-dining' },
          { id: 'sub-furn-beds', name: 'Beds & Wardrobes', slug: 'beds-wardrobes' },
          { id: 'sub-furn-home-decor', name: 'Home Decor & Garden', slug: 'home-decor' }
        ]
      },
      {
        id: 'cat-fashion',
        name: 'Fashion',
        slug: 'fashion',
        iconName: 'Shirt',
        color: 'bg-pink-50 text-pink-800',
        subcategories: [
          { id: 'sub-fash-men', name: 'Men Clothes & Footwear', slug: 'men-fashion' },
          { id: 'sub-fash-women', name: 'Women Clothes & Footwear', slug: 'women-fashion' },
          { id: 'sub-fash-watches', name: 'Watches & Accessories', slug: 'watches-accessories' }
        ]
      },
      {
        id: 'cat-books',
        name: 'Books, Sports & Hobbies',
        slug: 'books-sports',
        iconName: 'BookOpen',
        color: 'bg-orange-50 text-orange-800',
        subcategories: [
          { id: 'sub-book-books', name: 'Books & Educational Supplies', slug: 'books' },
          { id: 'sub-book-gym', name: 'Gym & Fitness Equipment', slug: 'gym-equipment' },
          { id: 'sub-book-music', name: 'Musical Instruments', slug: 'musical-instruments' }
        ]
      },
      {
        id: 'cat-pets',
        name: 'Pets',
        slug: 'pets',
        iconName: 'Dog',
        color: 'bg-cyan-50 text-cyan-800',
        subcategories: [
          { id: 'sub-pet-dogs', name: 'Dogs & Puppies', slug: 'dogs' },
          { id: 'sub-pet-food', name: 'Pet Food & Accessories', slug: 'pet-food-accessories' }
        ]
      },
      {
        id: 'cat-services',
        name: 'Services',
        slug: 'services',
        iconName: 'Wrench',
        color: 'bg-blue-50 text-blue-800',
        subcategories: [
          { id: 'sub-serv-repair', name: 'Electronics & Appliance Repair', slug: 'electronics-repair' },
          { id: 'sub-serv-movers', name: 'Packers & Movers', slug: 'packers-movers' },
          { id: 'sub-serv-home', name: 'Home Improvement & Painting', slug: 'home-improvement' }
        ]
      },
      {
        id: 'cat-jobs',
        name: 'Jobs',
        slug: 'jobs',
        iconName: 'Briefcase',
        color: 'bg-slate-100 text-slate-800',
        subcategories: [
          { id: 'sub-jobs-data', name: 'Data Entry & Back Office', slug: 'data-entry' },
          { id: 'sub-jobs-sales', name: 'Sales & Marketing', slug: 'sales-marketing' },
          { id: 'sub-jobs-driver', name: 'Driver & Delivery Ops', slug: 'driver-jobs' }
        ]
      }
    ];

    const inserted = await Category.insertMany(defaultCategories);
    res.status(201).json({ message: 'Categories seeded successfully', count: inserted.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getCategories, seedCategories };
