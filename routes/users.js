"use strict";

const express = require('express');
const isAuth = require('../middleware/is-auth');
const isAdmin = require('../middleware/is-admin');
const usersController = require('../controllers/usersController');

const router = express.Router();

router.get('/',  isAuth, usersController.getUsers);

router.delete('/',  isAuth, isAdmin, usersController.deleteUsersById);

router.put('/:id',  isAuth, isAdmin, usersController.modifyUser);

router.get('/profile',  isAuth, usersController.getUserProfile);

router.get('/:id',  isAuth, usersController.getUsersById);

module.exports = router;