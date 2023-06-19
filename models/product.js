const { number, required } = require('joi');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      index: { type: 'text' },
    },
    isSold: {
      type: Boolean,
      required: true,
      default: false
    },
    price: {
      type: Number,
      required: true
    },
    title: {
      type: String,
      required: true,
      maxlength: 50, // Maximum length of 50 characters
    },
    description: {
      type: String,
      required: true,
      maxlength: 255, // Maximum length of 255 characters
    },
    categoryId: {
      type: Schema.Types.ObjectId, // Assuming categoryID refers to the ObjectID of a category
      required: true,
      ref: 'Category', // Reference to the Category model
    },
    imageURL: {
      type: [String], // Array of strings (URLs)
      required: true,
      validate: {
        validator: function (arr) {
          return arr.every(url => url.length <= 255); // Maximum length of 255 characters for each URL
        },
        message: 'Image URL must be less than 255 characters'
      }
    },
    userId: {
      type: Schema.Types.ObjectId, 
      required: true,
      ref: 'User', // Reference to the User model
    }
  },
  { timestamps: true }
);


module.exports = mongoose.model('Product', productSchema);
