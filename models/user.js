const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
        email: {
          type: String,
          required: true,
          unique: true, // Ensure email is unique
          maxlength: 50, // Maximum length of 50 characters
          match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ // Email format validation
        },
        firstName: {
          type: String,
          required: true,
          minlength: 3, // Minimum length of 3 characters
          maxlength: 50, // Maximum length of 50 characters
        },
        lastName: {
          type: String,
          required: true,
          minlength: 3, // Minimum length of 3 characters
          maxlength: 50, // Maximum length of 50 characters
        },
        password: {
          type: String,
          required: true,
          minlength: 6, // Minimum length of 6 characters
        },
        city: {
          type: String,
          required: true,
          maxlength: 50, // Maximum length of 50 characters
        },
        isAdmin: {
          type: Boolean,
          required: true
        },
        cart: {
          type: Array,
          required: true
        },
      },
      { timestamps: true }
    );

module.exports = mongoose.model('User', userSchema);
