"use strict";

const express = require('express');
const isAuth = require('../middleware/is-auth');
const isAdmin = require('../middleware/is-admin');
const cors = require('../middleware/midCors');
const productsController = require('../controllers/productsController');

const router = express.Router();



router.get('/', cors,isAuth, productsController.getProducts);

router.delete('/:id', cors, isAuth, isAdmin, productsController.deleteProductsById);

router.get('/search', cors, isAuth, productsController.getProductsBySearch);

router.get('/:id', cors, isAuth, productsController.getProductsById);

router.post('/createProduct', cors, isAuth, isAdmin, productsController.createProduct);

router.put('/:id', cors, isAuth, isAdmin, productsController.modifyProduct);

router.get('/user/:userId', cors, isAuth, isAdmin, productsController.getProductsByUserId);

module.exports = router;