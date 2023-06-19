"use strict";

const express = require('express');
const isAuth = require('../middleware/is-auth');
const cors = require('../middleware/midCors');
const cartsController = require('../controllers/cartsController');

const router = express.Router();

router.get('/:userId', cors, cartsController.getCartContent);

router.delete('/delete/:userId', cors, isAuth, cartsController.deleteCartContentById);

router.put('/:userId', cors, isAuth, cartsController.addContentToCart);

router.delete('/:userId', cors, isAuth, cartsController.emptyCart);

module.exports = router;