"use strict";

const express = require('express');
const isAuth = require('../middleware/is-auth');
const cartsController = require('../controllers/cartsController');

const router = express.Router();

router.get('/:userId',  cartsController.getCartContent);

router.delete('/delete/:userId',  isAuth, cartsController.deleteCartContentById);

router.put('/:userId',  isAuth, cartsController.addContentToCart);

router.delete('/:userId',  isAuth, cartsController.emptyCart);

module.exports = router;