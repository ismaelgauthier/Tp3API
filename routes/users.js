"use strict";

const express = require('express');
const isAuth = require('../middleware/is-auth');
const isAdmin = require('../middleware/is-admin');
const cors = require('../middleware/midCors');
const usersController = require('../controllers/usersController');

const router = express.Router();

router.get('/', cors, isAuth, usersController.getUsers);

router.delete('/', cors, isAuth, isAdmin, usersController.deleteUsersById);

router.put('/:id', cors, isAuth, isAdmin, usersController.modifyUser);

router.get('/profile', cors, isAuth, usersController.getUserProfile);

router.get('/:id', cors, isAuth, usersController.getUsersById);

module.exports = router;