const mongoose = require('mongoose');

const subcategorySchema = new mongoose.Schema({
  id: String,
  name: { type: String, required: true },
  slug: { type: String, required: true },
  iconName: String
});

const categorySchema = new mongoose.Schema(
  {
    id: String,
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    iconName: { type: String, required: true },
    color: { type: String, default: 'bg-teal-50 text-[#002f34]' },
    subcategories: [subcategorySchema]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Category', categorySchema);
