// This component defiens the API routes for user authentication

// using express to create and manage API routes
import express from "express";

// importing the signin and signup controllers
import { signin, signup } from "../controllers/auth.js";

// creating a new express router
// this helps us define routes separately from the main server file, keeping the code modular
const router = express.Router();

// two POST requests that call signup and signin when a user submits a registration request / tries to log in
router.post("/signup", signup);
router.post("/signin", signin);
// the routes send date in the request body (req.body), which is processed in its specific controller function


export default router;
