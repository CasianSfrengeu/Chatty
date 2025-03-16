import jwt from "jsonwebtoken";
import { handleError } from "./error.js";

export const verifyToken = (req, res, next) => {
  // defining and storing the token data from the request body
  const token = req.cookies.access_token;

  // if token is empty, the JWT was not generated properly and an error messsage will apear
  if (!token) return next(handleError(401, "You are not authenticated"));

  // token verification
  jwt.verify(token, process.env.JWT, (err, user) => {
    // error handling
    if (err) return next(createError(403, "Token is invalid"));
    req.user = user;
    next();
  });
};
