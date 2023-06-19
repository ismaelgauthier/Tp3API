"use strict";

const Product = require('../models/product');

const isAdmin = (req, res, next) => {

    return(!req.user || !req.user.isAdmin) 
  };

exports.getProducts = (req, res) => {
    Product.find().then((products) => {
    res.status(200).json(products);
    })
}

exports.getProductsById = (req, res) => {
    Product.findById(req.params.id).then((products) =>{
        res.status(200).json(products);
    })
}
exports.deleteProductsById = (req, res) => {
    if (!isAdmin(req, res)){
        res.status(401).json({ message: 'Unauthorized' });
        return
    }
    Product.findById(req.query.id)
        .then((product) => {
            if (!product) {
                return res.status(404).json({ message: 'Product not found' });
            }

            Product.findByIdAndDelete({_id: req.query.id}).then(()=>{
                res.status(200).json({ message: 'Product deleted successfully' })
            });
        })
        .catch((error) => {
            res.status(500).json({ message: 'Failed to delete product', error });
        });
};

exports.getProductsBySearch = (req, res) => {
    const searchTerm = req.query.q
    Product.find().then((products) => {
        products = products.filter(product => product.title.includes(searchTerm))
        res.status(200).json(products);
        })
};

exports.createProduct = (req, res) => {
    if (!isAdmin(req, res)){
        res.status(401).json({ message: 'Unauthorized' });
        return
    }
    const name = req.body.name;
    const isSold = req.body.isSold;
    const price = req.body.price;
    const title = req.body.title;
    const description = req.body.description;
    const imageUrl = req.body.imageUrl;
    const userId = req.body.userId;
    const categoryId = req.body.categoryId;
    Product.create({ name, isSold, price, title, description, imageUrl, userId, categoryId})
        .then((product) => {
          res.status(201).json({ message: 'Product created successfully', product });
        })
        .catch((error) => {
          res.status(500).json({ message: 'Failed to create product', error });
        });
    };
  
exports.modifyProduct = (req, res) => {
    const productId = req.params.id;
    const updatedProduct = req.body;
    
    Product.findByIdAndUpdate(productId, updatedProduct, { new: true })
        .then((product) => {
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json({ message: 'Product modified successfully', product });
        })
        .catch((error) => {
        res.status(500).json({ message: 'Failed to modify product', error });
        });
    };

    exports.getProductsByUserId = (req, res) => {
        const userId = req.params.userId;
        Product.find().then((products) => {
            products = products.filter(product => product.userId == userId);
            res.status(200).json(products);
            })
    };
  