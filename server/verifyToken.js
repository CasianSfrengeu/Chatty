import jwt from "jsonwebtoken";
import { handleError } from "./error.js";

// ✅ Verifică tokenul din header sau cookie
export const verifyToken = (req, res, next) => {
  // 1. Încearcă să ia tokenul din Authorization header
  const authHeader = req.headers.authorization;
  const tokenFromHeader = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

  // 2. Sau din cookie
  const tokenFromCookie = req.cookies?.access_token;

  const token = tokenFromHeader || tokenFromCookie;

  // Dacă nu există token
  if (!token) return next(handleError(401, "You are not authenticated"));

  // Verificare token JWT
  jwt.verify(token, process.env.JWT, (err, user) => {
    if (err) return next(handleError(403, "Token is invalid"));
    req.user = user;
    next();
  });
};
