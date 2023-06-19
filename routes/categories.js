"use strict";

const express = require('express');
const isAuth = require('../middleware/is-auth');
const isAdmin = require('../middleware/is-admin');
const cors = require('../middleware/midCors');
const categoriesController = require('../controllers/categoriesController');

const router = express.Router();

router.get('/', cors, isAuth, categoriesController.getCategories);

router.get('/:id', cors, isAuth, categoriesController.getCategoriesById);

router.delete('/', cors, isAuth, isAdmin, categoriesController.deleteCategoriesById);

router.post('/createCategory', cors, isAuth, isAdmin, categoriesController.createCategory);

router.put('/:id', cors, isAuth, isAdmin, categoriesController.modifyCategory);

module.exports = router;