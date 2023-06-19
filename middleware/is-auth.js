"use strict";

const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();



module.exports = (req, res, next) => {
  const authHeader = req.get('Authorization');
  console.log('authHeader', authHeader)
  if (!authHeader) {
    res.status(401).json({ error: 'Non authentifié..' });
  }
  const token = authHeader.split(' ')[1];
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, process.env.SECRET_JWT);
  } catch (err) {
    err.statusCode = 401;
    throw err;
  }
  if (!decodedToken) {
    const error = new Error('Non authentifié.');
    error.statusCode = 401;
    throw error;
  }

  req.user = decodedToken;
  console.log('decodedToken', decodedToken)
  next();
};

