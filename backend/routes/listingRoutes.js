const express = require('express');
const router = express.Router();
const {
  getListings,
  getListingById,
  createListing,
  updateListing,
  deleteListing,
  boostListing
} = require('../controllers/listingController');

router.get('/', getListings);
router.get('/:id', getListingById);
router.post('/', createListing);
router.put('/:id', updateListing);
router.delete('/:id', deleteListing);
router.post('/:id/boost', boostListing);

module.exports = router;
