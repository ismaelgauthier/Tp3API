"use strict";

const express = require('express');
const isAuth = require('../middleware/is-auth');
const isAdmin = require('../middleware/is-admin');
const productsController = require('../controllers/productsController');

const router = express.Router();



router.get('/',isAuth, productsController.getProducts);

router.delete('/:id',isAuth, isAdmin, productsController.deleteProductsById);

router.get('/search',isAuth, productsController.getProductsBySearch);

router.get('/:id',isAuth, productsController.getProductsById);

router.post('/createProduct',isAuth, isAdmin, productsController.createProduct);

router.put('/:id',isAuth, isAdmin, productsController.modifyProduct);

router.get('/user/:userId',isAuth, isAdmin, productsController.getProductsByUserId);

module.exports = router;