"use strict";

const User = require('../models/user');
const Product = require('../models/product');
exports.getCartContent = (req, res) => {
    const userId = req.params.userId;
  
    User.findById(userId)
      .then((user) => {
        if (!user) {

          return res.status(404).json({ message: 'User not found' });
        }
  
        // Access the cart property
        const cartContent = user.cart;
  
        res.status(200).json({ cart: cartContent });
      })
      .catch((error) => {
        res.status(500).json({ message: 'Failed to return cart content', error });
      });
  };

  exports.deleteCartContentById = (req, res) => {
    const userId = req.params.userId;
    const productId = req.body.productId;
  
    // Check if the product exists
    Product.findById(productId)
      .then((product) => {
        if (!product) {
          return res.status(404).json({ message: 'Product not found' });
        }
  
        // Product exists, proceed with removing it from the user's cart
        User.findById(userId)
          .then((user) => {
            if (!user) {
              return res.status(404).json({ message: 'User not found' });
            }
  
            // Find the index of the product in the cart array
            const productIndex = user.cart.indexOf(productId);
  
            // If the product is not in the cart, return an error
            if (productIndex === -1) {
              return res.status(404).json({ message: 'Product not found in the cart' });
            }
  
            // Remove the product from the cart array
            user.cart.splice(productIndex, 1);
  
            product.isSold = false;
            
            // Save the updated user document
            return user.save();
          })
          .then(() => {
            res.status(200).json({ message: 'Item removed from cart successfully' });
          })
          .catch((error) => {
            res.status(500).json({ message: 'Failed to remove item from cart', error });
          });
      })
      .catch((error) => {
        res.status(500).json({ message: 'Failed to find product', error });
      });
  };

  exports.addContentToCart = (req, res) => {
    const userId = req.params.userId;
    const productId = req.body.productId;
  
    // Check if the product exists
    Product.findById(productId)
      .then((product) => {
        if (!product) {
          return res.status(404).json({ message: 'Product not found' });
        }
  
        // Check if the product is already sold
        if (product.isSold) {
          return res.status(400).json({ message: 'Product is already sold' });
        }
  
        // Product exists and is not sold, proceed with adding it to the user's cart
        User.findById(userId)
          .then((user) => {
            if (!user) {
              return res.status(404).json({ message: 'User not found' });
            }
  
            // Add the productId to the cart array
            user.cart.push(productId);
  
            // Update the "isSold" property of the product to true
            product.isSold = true;
  
            // Save the updated user and product documents
            return Promise.all([user.save(), product.save()]);
          })
          .then(() => {
            res.status(200).json({ message: 'Item added to cart successfully' });
          })
          .catch((error) => {
            res.status(500).json({ message: 'Failed to add item to cart', error });
          });
      })
      .catch((error) => {
        res.status(500).json({ message: 'Failed to find product', error });
      });
  };

  exports.emptyCart = (req, res) => {
    const userId = req.params.userId;
  
    User.findById(userId)
      .then((user) => {
        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }
  
        // Empty the cart array
        user.cart = [];
  
        // Save the updated user document
        return user.save();
      })
      .then(() => {
        res.status(200).json({ message: 'Cart emptied successfully' });
      })
      .catch((error) => {
        res.status(500).json({ message: 'Failed to empty cart', error });
      });
  };