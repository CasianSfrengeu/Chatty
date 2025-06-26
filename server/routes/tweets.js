// this component defines the backend API routes for managing tweets (creating, deleting, liking/disliking), fetching tweets and exploring tweets

import express from "express";
import { verifyToken } from "../verifyToken.js";

// importing the tweet controller functions
import {
  createTweet,
  deleteTweet,
  likeOrDislike,
  getAllTweets,
  getUserTweets,
  getExploreTweets,
  searchTweets,
} from "../controllers/tweet.js";

// creating a new router instance
const router = express.Router();

// verifying token before allowing the user to create or delete a tweet
// if token is verified, we call the functions from the controller
router.post("/", verifyToken, createTweet);
router.delete("/:id", verifyToken, deleteTweet);

// liking or disliking posts
router.put("/:id/like", likeOrDislike);

// get the timeline posts
router.get("/timeline/:id", getAllTweets);

// gets only one specific user's posts
router.get("/user/all/:id", getUserTweets);

//explore
router.get("/explore", getExploreTweets);

//search tweets
router.get("/search", searchTweets);

export default router;
