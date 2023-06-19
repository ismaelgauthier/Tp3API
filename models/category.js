const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const categorySchema = new Schema(
  {
name: {
      type: String,
      required: true,
      match: /^.{1,50}$/
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Category', categorySchema);
