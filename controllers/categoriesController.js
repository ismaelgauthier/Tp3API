"use strict";

const Category = require('../models/category');

  exports.getCategories = (req, res) => {
   Category.find().then((categories) => {
    res.status(200).json(categories);
    })
}

exports.getCategoriesById = (req, res) => {
    Category.findById(req.params.id).then((categories) =>{
        res.status(200).json(categories);
    })
}
exports.deleteCategoriesById = (req, res) => {
        Category.findById(req.query.id)
        .then((category) => {
            if (!category) {
                return res.status(404).json({ message: 'Category not found' });
            }

            Category.findByIdAndDelete({_id: req.query.id}).then(()=>{
                res.status(200).json({ message: 'Category deleted successfully' })
            });
        })
        .catch((error) => {
            res.status(500).json({ message: 'Failed to delete category', error });
        });
};

exports.createCategory = (req, res, next) => {

    const name = req.body.name;
      Category.create({ name })
        .then((category) => {
          res.status(201).json({ message: 'Category created successfully', category });
        })
        .catch((error) => {
          res.status(500).json({ message: 'Failed to create category', error });
        });
    };

exports.modifyCategory = (req, res) => {
    const categoryId = req.params.id;
    const updatedCategory = req.body;
    
    Category.findByIdAndUpdate(categoryId, updatedCategory, { new: true })
        .then((category) => {
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.status(200).json({ message: 'Category modified successfully', category });
        })
        .catch((error) => {
        res.status(500).json({ message: 'Failed to modify category', error });
        });
    };
