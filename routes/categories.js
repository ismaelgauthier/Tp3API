"use strict";

const express = require('express');
const isAuth = require('../middleware/is-auth');
const isAdmin = require('../middleware/is-admin');
const categoriesController = require('../controllers/categoriesController');

const router = express.Router();

router.get('/',  isAuth, categoriesController.getCategories);

router.get('/:id',  isAuth, categoriesController.getCategoriesById);

router.delete('/',  isAuth, isAdmin, categoriesController.deleteCategoriesById);

router.post('/createCategory',  isAuth, isAdmin, categoriesController.createCategory);

router.put('/:id',  isAuth, isAdmin, categoriesController.modifyCategory);

module.exports = router;