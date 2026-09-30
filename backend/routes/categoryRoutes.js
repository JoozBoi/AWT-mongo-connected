const express = require('express');
const router = express.Router();
const { getCategories, seedCategories } = require('../controllers/categoryController');

router.get('/', getCategories);
router.post('/seed', seedCategories);

module.exports = router;
