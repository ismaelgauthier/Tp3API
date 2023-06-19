"use strict";

const User = require('../models/user');

exports.getUsers = (req, res, next) => {
    User.find().then((users) => {
    res.status(200).json(users);
    })
}

exports.getUsersById = (req, res) => {
    User.findById(req.params.id).then((users) =>{
        res.status(200).json(users);
    })
}

exports.deleteUsersById = (req, res) => {
    console.log(req.query)
    User.findById(req.query.id)
        .then((user) => {
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            User.findByIdAndDelete({_id: req.query.id}).then(()=>{
                res.status(200).json({ message: 'User deleted successfully' })
            });
        })
        .catch((error) => {
            res.status(500).json({ message: 'Failed to delete user', error });
        });
};

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

  exports.getUserProfile = (req, res) => {
    User.findById(req.user.userId).then((users) =>{
        res.status(200).json(users);
    })
  }