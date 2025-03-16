// This controller handles user authentication (signup and signin)

import User from "../models/User.js";

//importing bcrypt and jwt for password hashing and JWT authentication
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// import for error handling
import { handleError } from "../error.js";


export const signup = async (req, res, next) => {
  try {
    // generating a salt and hashing the password
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(req.body.password, salt);
    const newUser = new User({ ...req.body, password: hash });

    // saving the new user in the database
    await newUser.save();

    // generating a JWT token for authentication
    const token = jwt.sign({ id: newUser._id }, process.env.JWT);

    // excluding the password from the response
    const { password, ...othersData } = newUser._doc;

    // sending token in a HTTP-only cookie and returning the user data
    res
      .cookie("access_token", token, {
        httpOnly: true,
      })
      .status(200)
      .json(othersData);
  // catching any errors (handled in error.js)
  } catch (err) {
    next(err);
  }
};


export const signin = async (req, res, next) => {
  try {
    // finding the user by their username
    const user = await User.findOne({ username: req.body.username });

    // error if user is not found
    if (!user) return next(handleError(404, "User not found"));

    // comparing password input with the hashed password in the database
    const isCorrect = await bcrypt.compare(req.body.password, user.password);
    // if the password is wrong we return an error
    if (!isCorrect) return next(handleError(400, "Wrong password"));

    // generating the JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT);
    // exluding the password from the request response
    const { password, ...othersData } = user._doc;

    // sending token in a HTTP-only cookie and returning the user data
    res
      .cookie("access_token", token, { httpOnly: true })
      .status(200)
      .json(othersData);
  } catch (err) {
    next(err);
  }
};
