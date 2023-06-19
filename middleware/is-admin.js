"use strict";

const User = require('../models/user');


module.exports = (req, res, next) => {
  User.findById(req.user.userId).then((user) =>{
    if (!user.isAdmin) {
      res.status(403).json({ error: 'Non autorisé..' });
    }
    else {
      next();
    }})
};

