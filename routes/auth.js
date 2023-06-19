"use strict";

const express = require('express');

const authController = require('../controllers/authController');
const cors = require('../middleware/midCors');
const router = express.Router();

// /auth/login/ => POST
router.post('/login', cors, authController.login);

// /auth/signup/ => POST
router.post('/signup', cors, authController.signup);

module.exports = router;
