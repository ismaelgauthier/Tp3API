# Tp3API
 
"use strict";

// Importing required modules
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const User = require('../models/user');


 * Handles the user login functionality.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
exports.login = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  let loadedUser;

  // Find the user with the provided email in the database
  User.findOne({ email: email })
    .then(user => {
      // If the user is not found, throw an error
      if (!user) {
        const error = new Error('Utilisateur non trouvé');
        error.statusCode = 404;
        throw error;
      }

      loadedUser = user;

      // Compare the provided password with the hashed password stored in the database
      return bcrypt.compare(password, user.password);
    })
    .then(isEqual => {
      // If the passwords don't match, throw an error
      if (!isEqual) {
        const error = new Error('Mauvais mot de passe !');
        error.statusCode = 401;
        throw error;
      }
      
      // Generate a JSON Web Token (JWT) for the authenticated user
      const token = jwt.sign(
        {
          email: loadedUser.email,
          name: loadedUser.name,
          userId: loadedUser._id.toString()
        },
        process.env.SECRET_JWT,
        { expiresIn: '12h' }
      );

      // Send the token in the response
      res.status(200).json({ token: token });
    })
    .catch(err => {
      // Pass any errors to the error handling middleware
      next(err);
    });
};


 * Handles the user signup functionality.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
exports.signup = (req, res, next) => {
  const email = req.body.email;
  const lastName = req.body.lastName;
  const firstName = req.body.firstName;
  const password = req.body.password;
  const city = req.body.city;
  const isAdmin = req.body.isAdmin;

  // Hash the user's password
  bcrypt
    .hash(password, 12)
    .then((hashedPassword) => {
      // Create a new User instance with the provided details
      const user = new User({
        email: email,
        firstName: firstName,
        password: hashedPassword,
        lastName: lastName,
        city: city,
        isAdmin: isAdmin
      });

      // Save the user in the database
      return user.save();
    })
    .then(result => {
      // Send a success response
      res.status(201).json({ message: "Utilisateur créé !", userId: result.id });
    })
    .catch(err => {
      // Pass any errors to the error handling middleware
      next(err);
    });
};


"use strict";

const User = require('../models/user');
const Product = require('../models/product');


 * Retrieves the content of the user's cart.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
exports.getCartContent = (req, res) => {
  const userId = req.params.userId;

  User.findById(userId)
    .then((user) => {
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Access the cart property
      const cartContent = user.cart;

      res.status(200).json({ cart: cartContent });
    })
    .catch((error) => {
      res.status(500).json({ message: 'Failed to return cart content', error });
    });
};


 * Deletes a product from the user's cart by its ID.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
exports.deleteCartContentById = (req, res) => {
  const userId = req.params.userId;
  const productId = req.body.productId;

  // Check if the product exists
  Product.findById(productId)
    .then((product) => {
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      // Product exists, proceed with removing it from the user's cart
      User.findById(userId)
        .then((user) => {
          if (!user) {
            return res.status(404).json({ message: 'User not found' });
          }

          // Find the index of the product in the cart array
          const productIndex = user.cart.indexOf(productId);

          // If the product is not in the cart, return an error
          if (productIndex === -1) {
            return res.status(404).json({ message: 'Product not found in the cart' });
          }

          // Remove the product from the cart array
          user.cart.splice(productIndex, 1);

          product.isSold = false;

          // Save the updated user document
          return user.save();
        })
        .then(() => {
          res.status(200).json({ message: 'Item removed from cart successfully' });
        })
        .catch((error) => {
          res.status(500).json({ message: 'Failed to remove item from cart', error });
        });
    })
    .catch((error) => {
      res.status(500).json({ message: 'Failed to find product', error });
    });
};


 * Adds a product to the user's cart.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
exports.addContentToCart = (req, res) => {
  const userId = req.params.userId;
  const productId = req.body.productId;

  // Check if the product exists
  Product.findById(productId)
    .then((product) => {
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      // Check if the product is already sold
      if (product.isSold) {
        return res.status(400).json({ message: 'Product is already sold' });
      }

      // Product exists and is not sold, proceed with adding it to the user's cart
      User.findById(userId)
        .then((user) => {
          if (!user) {
            return res.status(404).json({ message: 'User not found' });
          }

          // Add the productId to the cart array
          user.cart.push(productId);

          // Update the "isSold" property of the product to true
          product.isSold = true;

          // Save the updated user and product documents
          return Promise.all([user.save(), product.save()]);
        })
        .then(() => {
          res.status(200).json({ message: 'Item added to cart successfully' });
        })
        .catch((error) => {
          res.status(500).json({ message: 'Failed to add item to cart', error });
        });
    })
    .catch((error) => {
      res.status(500).json({ message: 'Failed to find product', error });
    });
};


 * Empties the user's cart.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
exports.emptyCart = (req, res) => {
  const userId = req.params.userId;

  User.findById(userId)
    .then((user) => {
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Empty the cart array
      user.cart = [];

      // Save the updated user document
      return user.save();
    })
    .then(() => {
      res.status(200).json({ message: 'Cart emptied successfully' });
    })
    .catch((error) => {
      res.status(500).json({ message: 'Failed to empty cart', error });
    });
};


"use strict";

const Category = require('../models/category');


 * Retrieves all categories.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
exports.getCategories = (req, res) => {
  Category.find().then((categories) => {
    res.status(200).json(categories);
  });
};


 * Retrieves a category by its ID.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
exports.getCategoriesById = (req, res) => {
  Category.findById(req.params.id).then((categories) => {
    res.status(200).json(categories);
  });
};


 * Deletes a category by its ID.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
exports.deleteCategoriesById = (req, res) => {
  Category.findById(req.query.id)
    .then((category) => {
      if (!category) {
        return res.status(404).json({ message: 'Category not found' });
      }

      Category.findByIdAndDelete({ _id: req.query.id }).then(() => {
        res.status(200).json({ message: 'Category deleted successfully' });
      });
    })
    .catch((error) => {
      res.status(500).json({ message: 'Failed to delete category', error });
    });
};


 * Creates a new category.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
exports.createCategory = (req, res, next) => {
  const name = req.body.name;
  Category.create({ name })
    .then((category) => {
      res.status(201).json({ message: 'Category created successfully', category });
    })
    .catch((error) => {
      res.status(500).json({ message: 'Failed to create category', error });
    });
};


 * Modifies an existing category.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
exports.modifyCategory = (req, res) => {
  const categoryId = req.params.id;
  const updatedCategory = req.body;

  Category.findByIdAndUpdate(categoryId, updatedCategory, { new: true })
    .then((category) => {
      if (!category) {
        return res.status(404).json({ message: 'Category not found' });
      }
      res.status(200).json({ message: 'Category modified successfully', category });
    })
    .catch((error) => {
      res.status(500).json({ message: 'Failed to modify category', error });
    });
};


"use strict";


 * Logs errors to the console and sends an error response.
 *
 * @param {Error} err - The error object.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
exports.logErrors = (err, req, res, next) => {
  console.error(`An error occurred! ${err.stack}`);
  if (!err.statusCode) err.statusCode = 500;
  res.status(err.statusCode).json({ message: err.message, statusCode: err.statusCode });
};


 * Handles 404 errors and sends a response with a "Page not found" message.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
exports.get404 = (req, res) => {
  res.status(404).json({ pageTitle: 'Page introuvable !' });
};


"use strict";

const Product = require('../models/product');

/**
 * Retrieves all products.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
exports.getProducts = (req, res) => {
  Product.find().then((products) => {
    res.status(200).json(products);
  });
};

/**
 * Retrieves a product by its ID.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
exports.getProductsById = (req, res) => {
  Product.findById(req.params.id).then((products) => {
    res.status(200).json(products);
  });
};

/**
 * Deletes a product by its ID.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
exports.deleteProductsById = (req, res) => {
  Product.findById(req.query.id)
    .then((product) => {
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      Product.findByIdAndDelete({ _id: req.query.id }).then(() => {
        res.status(200).json({ message: 'Product deleted successfully' });
      });
    })
    .catch((error) => {
      res.status(500).json({ message: 'Failed to delete product', error });
    });
};

/**
 * Retrieves products based on a search term.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
exports.getProductsBySearch = (req, res) => {
  const searchTerm = req.query.q;
  Product.find().then((products) => {
    products = products.filter((product) => product.title.includes(searchTerm));
    res.status(200).json(products);
  });
};

/**
 * Creates a new product.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
exports.createProduct = (req, res) => {
  const name = req.body.name;
  const isSold = req.body.isSold;
  const price = req.body.price;
  const title = req.body.title;
  const description = req.body.description;
  const imageUrl = req.body.imageUrl;
  const userId = req.body.userId;
  const categoryId = req.body.categoryId;
  Product.create({
    name,
    isSold,
    price,
    title,
    description,
    imageUrl,
    userId,
    categoryId,
  })
    .then((product) => {
      res.status(201).json({ message: 'Product created successfully', product });
    })
    .catch((error) => {
      res.status(500).json({ message: 'Failed to create product', error });
    });
};

/**
 * Modifies a product.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
exports.modifyProduct = (req, res) => {
  const productId = req.params.id;
  const updatedProduct = req.body;

  Product.findByIdAndUpdate(productId, updatedProduct, { new: true })
    .then((product) => {
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      res.status(200).json({ message: 'Product modified successfully', product });
    })
    .catch((error) => {
      res.status(500).json({ message: 'Failed to modify product', error });
    });
};


 * Retrieves products by a user's ID.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
exports.getProductsByUserId = (req, res) => {
  const userId = req.params.userId;
  Product.find().then((products) => {
    products = products.filter((product) => product.userId == userId);
    res.status(200).json(products);
  });
};


"use strict";

const User = require('../models/user');

/**
 * Retrieves all users.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
exports.getUsers = (req, res, next) => {
  User.find().then((users) => {
    res.status(200).json(users);
  });
};

/**
 * Retrieves a user by their ID.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
exports.getUsersById = (req, res) => {
  User.findById(req.params.id).then((users) => {
    res.status(200).json(users);
  });
};

/**
 * Deletes a user by their ID.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
exports.deleteUsersById = (req, res) => {
  console.log(req.query);
  User.findById(req.query.id)
    .then((user) => {
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      User.findByIdAndDelete({ _id: req.query.id }).then(() => {
        res.status(200).json({ message: 'User deleted successfully' });
      });
    })
    .catch((error) => {
      res.status(500).json({ message: 'Failed to delete user', error });
    });
};

/**
 * Modifies a user.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
exports.modifyUser = (req, res) => {
  const userId = req.params.id;
  const updatedUser = req.body;

  User.findByIdAndUpdate(userId, updatedUser, { new: true })
    .then((user) => {
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.status(200).json({ message: 'User modified successfully', user });
    })
    .catch((error) => {
      res.status(500).json({ message: 'Failed to modify user', error });
    });
};


 * Retrieves the profile of the authenticated user.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
exports.getUserProfile = (req, res) => {
  User.findById(req.user.userId).then((users) => {
    res.status(200).json(users);
  });
};

"use strict";

const User = require('../models/user');


 * Middleware to check if the user is an admin for authorization.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
module.exports = (req, res, next) => {
  User.findById(req.user.userId).then((user) => {
    if (!user.isAdmin) {
      res.status(403).json({ error: 'Non autorisé..' });
    } else {
      next();
    }
  });
};


"use strict";

const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();


 * Middleware to check if the user is authenticated and verify the JWT token.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
module.exports = (req, res, next) => {
  const authHeader = req.get('Authorization');
  console.log('authHeader', authHeader);
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
  console.log('decodedToken', decodedToken);
  next();
};

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const categorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      match: /^.{1,50}$/
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Category', categorySchema);

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      index: { type: 'text' },
    },
    isSold: {
      type: Boolean,
      required: true,
      default: false
    },
    price: {
      type: Number,
      required: true
    },
    title: {
      type: String,
      required: true,
      maxlength: 50,
    },
    description: {
      type: String,
      required: true,
      maxlength: 255,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Category',
    },
    imageURL: {
      type: [String],
      required: true,
      validate: {
        validator: function (arr) {
          return arr.every(url => url.length <= 255);
        },
        message: 'Image URL must be less than 255 characters'
      }
    },
    userId: {
      type: Schema.Types.ObjectId, 
      required: true,
      ref: 'User',
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      maxlength: 50,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },
    firstName: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 50,
    },
    lastName: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 50,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    city: {
      type: String,
      required: true,
      maxlength: 50,
    },
    isAdmin: {
      type: Boolean,
      required: true
    },
    cart: {
      type: Array,
      required: true
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
"use strict";

const express = require('express');
const authController = require('../controllers/authController');
const router = express.Router();

// /auth/login/ => POST
router.post('/login', authController.login);

// /auth/signup/ => POST
router.post('/signup', authController.signup);

module.exports = router;
"use strict";

const express = require('express');
const isAuth = require('../middleware/is-auth');
const cartsController = require('../controllers/cartsController');
const router = express.Router();

router.get('/:userId', cartsController.getCartContent);
router.delete('/delete/:userId', isAuth, cartsController.deleteCartContentById);
router.put('/:userId', isAuth, cartsController.addContentToCart);
router.delete('/:userId', isAuth, cartsController.emptyCart);

module.exports = router;
"use strict";

const express = require('express');
const isAuth = require('../middleware/is-auth');
const isAdmin = require('../middleware/is-admin');
const categoriesController = require('../controllers/categoriesController');

const router = express.Router();

router.get('/', isAuth, categoriesController.getCategories);
router.get('/:id', isAuth, categoriesController.getCategoriesById);
router.delete('/', isAuth, isAdmin, categoriesController.deleteCategoriesById);
router.post('/createCategory', isAuth, isAdmin, categoriesController.createCategory);
router.put('/:id', isAuth, isAdmin, categoriesController.modifyCategory);

module.exports = router;
"use strict";

const express = require('express');
const isAuth = require('../middleware/is-auth');
const isAdmin = require('../middleware/is-admin');
const productsController = require('../controllers/productsController');

const router = express.Router();

router.get('/', isAuth, productsController.getProducts);
router.delete('/:id', isAuth, isAdmin, productsController.deleteProductsById);
router.get('/search', isAuth, productsController.getProductsBySearch);
router.get('/:id', isAuth, productsController.getProductsById);
router.post('/createProduct', isAuth, isAdmin, productsController.createProduct);
router.put('/:id', isAuth, isAdmin, productsController.modifyProduct);
router.get('/user/:userId', isAuth, isAdmin, productsController.getProductsByUserId);

module.exports = router;
"use strict";

const express = require('express');
const isAuth = require('../middleware/is-auth');
const isAdmin = require('../middleware/is-admin');
const usersController = require('../controllers/usersController');

const router = express.Router();

router.get('/', isAuth, usersController.getUsers);
router.delete('/', isAuth, isAdmin, usersController.deleteUsersById);
router.put('/:id', isAuth, isAdmin, usersController.modifyUser);
router.get('/profile', isAuth, usersController.getUserProfile);
router.get('/:id', isAuth, usersController.getUsersById);

module.exports = router;

SECRET_JWT = key

"use strict"; // Enables strict mode for JavaScript

require("dotenv").config(); // Loads environment variables from a .env file

const express = require('express'); // Imports the Express framework
const app = express(); // Creates an instance of the Express application
const mongoose = require('mongoose'); // Imports the Mongoose library for MongoDB

// Importing routes
const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users');
const productsRoutes = require('./routes/products');
const categoriesRoutes = require('./routes/categories');
const cartsRoutes = require('./routes/carts');

// Importing error controller
const errorController = require('./controllers/errorController');

app.use(express.json()); // Middleware to parse JSON bodies
app.use(express.urlencoded({ extended: false })); // Middleware to parse URL-encoded bodies

// Registering routes
app.use('/auth', authRoutes);
app.use('/categories', categoriesRoutes);
app.use('/products', productsRoutes);
app.use('/users', usersRoutes);
app.use('/carts', cartsRoutes);

// Error handling middleware
app.use(errorController.get404);
app.use(errorController.logErrors);

mongoose.connect('mongodb://127.0.0.1:27017/blogueTest1') // Connects to MongoDB using Mongoose
  .then(() => {
    console.log('La connexion à la base de données est établie');
    app.listen(3000, () => {
      console.log('Le serveur écoute sur le port 3000');
    });
  })
  .catch(err => {
    console.log('La connexion à la base de données a échoué', err);
  });
