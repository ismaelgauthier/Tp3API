"use strict";

exports.logErrors = (err, req, res, next) => {
  console.error(`Il y a une erreur ! ${err.stack}`);
  if (!err.statusCode) err.statusCode = 500;
  res.status(err.statusCode).json({ message: err.message, statusCode: err.statusCode });
};

exports.get404 = (req, res) => {
  res
    .status(404)
    .json({ pageTitle: 'Page introuvable !' });
};