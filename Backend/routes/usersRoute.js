const express = require('express');
const expressAsyncHandler = require('express-async-handler');
const asynHandler = require('express-async-handler');
const authMiddleware = require('../middlewares/authMiddleware');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

const usersRoute = express.Router();


usersRoute.post(
  '/register',
  asynHandler(async (req, res) => {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email: email });
    if (userExists) {
      throw new Error('User Exist');
    }
    const userCreated = await User.create({ email, name, password });
    res.json({
      _id: userCreated._id,
      name: userCreated.name,
      password: userCreated.password,
      email: userCreated.password,
      token: generateToken(userCreated._id),
    });
  })
);


usersRoute.post(
  '/login',
  asynHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.isPasswordMatch(password))) {
      //set status code
      res.status(200);

      res.json({
        _id: user._id,
        name: user.name,
        password: user.password,
        email: user.password,
        token: generateToken(user._id),
      });
    } else {
      res.status(401);
      throw new Error('Invalid credentials');
    }
  })
);


usersRoute.put(
  '/update',
  authMiddleware,
  expressAsyncHandler(async (req, res) => {
    //Find the login user by ID
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      if (req.body.password) {
        user.password = req.body.password || user.password;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        token: generateToken(updatedUser._id),
      });
    }
  })
);
