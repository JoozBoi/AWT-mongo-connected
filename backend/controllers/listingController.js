const Listing = require('../models/Listing');

// @desc    Get all listings with search, category filter, price filter, sorting
// @route   GET /api/listings
// @access  Public
const getListings = async (req, res) => {
  try {
    const { q, query, category, minPrice, maxPrice, city, featured, sortBy, page = 1, limit = 50 } = req.query;

    const filter = {};

    const searchQuery = q || query;
    if (searchQuery) {
      filter.$or = [
        { title: { $regex: searchQuery, $options: 'i' } },
        { description: { $regex: searchQuery, $options: 'i' } },
        { category: { $regex: searchQuery, $options: 'i' } },
        { brand: { $regex: searchQuery, $options: 'i' } }
      ];
    }

    if (category && category !== 'all') {
      filter.$or = [
        { categorySlug: category },
        { category: { $regex: category, $options: 'i' } }
      ];
    }

    if (city && city !== 'All India') {
      filter['location.city'] = { $regex: city, $options: 'i' };
    }

    if (featured === 'true') {
      filter.featured = true;
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    let sortOptions = { createdAt: -1 };
    if (sortBy === 'price_asc') {
      sortOptions = { price: 1 };
    } else if (sortBy === 'price_desc') {
      sortOptions = { price: -1 };
    } else if (sortBy === 'date_desc') {
      sortOptions = { createdAt: -1 };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const listings = await Listing.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit));

    const total = await Listing.countDocuments(filter);

    res.json({
      listings,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit))
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single listing by ID
// @route   GET /api/listings/:id
// @access  Public
const getListingById = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (listing) {
      // Increment view count automatically
      listing.viewsCount = (listing.viewsCount || 0) + 1;
      await listing.save();
      res.json(listing);
    } else {
      res.status(404).json({ message: 'Listing not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new listing
// @route   POST /api/listings
// @access  Private / Public (demo mode)
const createListing = async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      category,
      categorySlug,
      subcategory,
      condition,
      brand,
      images,
      location,
      seller,
      attributes
    } = req.body;

    const newListing = await Listing.create({
      title,
      description,
      price: Number(price),
      category,
      categorySlug,
      subcategory: subcategory || '',
      condition: condition || 'Used',
      brand: brand || '',
      images: images && images.length > 0 ? images : ['https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80'],
      location: location || { city: 'Mumbai', state: 'Maharashtra', locality: 'Bandra' },
      seller: seller || {
        id: req.user ? req.user._id : 'user-current',
        name: req.user ? req.user.name : 'Rahul Varma',
        avatar: req.user ? req.user.avatar : '',
        phone: req.user ? req.user.phone : '+91 98765 43210',
        memberSince: 'Jan 2022',
        rating: 5.0,
        isVerified: true
      },
      attributes: attributes || {}
    });

    res.status(201).json(newListing);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update listing details or status
// @route   PUT /api/listings/:id
// @access  Private / Admin
const updateListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (listing) {
      Object.assign(listing, req.body);
      const updated = await listing.save();
      res.json(updated);
    } else {
      res.status(404).json({ message: 'Listing not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a listing
// @route   DELETE /api/listings/:id
// @access  Private / Admin
const deleteListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (listing) {
      await Listing.deleteOne({ _id: listing._id });
      res.json({ message: 'Listing removed successfully' });
    } else {
      res.status(404).json({ message: 'Listing not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Boost / feature listing
// @route   POST /api/listings/:id/boost
// @access  Public / Private
const boostListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (listing) {
      listing.featured = true;
      const updated = await listing.save();
      res.json({ message: 'Listing boosted successfully', listing: updated });
    } else {
      res.status(404).json({ message: 'Listing not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getListings,
  getListingById,
  createListing,
  updateListing,
  deleteListing,
  boostListing
};
