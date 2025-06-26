// this controller manages tweet-related API functions, including
/*

-creating/deleting tweets
-liking/disliking tweets
-fetching timeline tweets
-fetching a specific user's tweets
-fetching trending tweets for the explore page
-searching tweets by content
-searching tweets by hashtags

*/

import Tweet from "../models/Tweet.js";
import { handleError } from "../error.js";
import User from "../models/User.js";

// Function to extract hashtags from text
const extractHashtags = (text) => {
  const hashtagRegex = /#[\w\u0590-\u05ff]+/g;
  const hashtags = text.match(hashtagRegex);
  return hashtags ? hashtags.map(tag => tag.toLowerCase()) : [];
};

// the createTweet function creates a new tweet object from the req body
export const createTweet = async (req, res, next) => {
  try {
    // Extract hashtags from the description
    const hashtags = extractHashtags(req.body.description);
    
    // Create tweet with hashtags
    const newTweet = new Tweet({
      ...req.body,
      hashtags: hashtags
    });
    
    // the tweet is saved to the database 
    const savedTweet = await newTweet.save();
    // the created tweet is returned as JSON
    res.status(200).json(savedTweet);
  } catch (err) {
    handleError(500, err);
  }
};

// the tweet deletion functio
export const deleteTweet = async (req, res, next) => {
  try {
    // we find the tweet by its ID
    const tweet = await Tweet.findById(req.params.id);
    if (tweet.userId === req.body.id) {
      await tweet.deleteOne();
      // if authorized, the tweet is deleted
      res.status(200).json("tweet has been deleted");
    } else {
      handleError(500, err);
    }
  } catch (err) {
    handleError(500, err);
  }
};

// liking/unliking tweets function
export const likeOrDislike = async (req, res, next) => {
  try {
    const tweet = await Tweet.findById(req.params.id);
    // checking if the tweet has already been liked by the user
    if (!tweet.likes.includes(req.body.id)) {
      // adding/deleting the like using $push / $pull
      await tweet.updateOne({ $push: { likes: req.body.id } });
      res.status(200).json("tweet has been liked");
    } else {
      await tweet.updateOne({ $pull: { likes: req.body.id } });
      res.status(200).json("tweet has been disliked");
    }
  } catch (err) {
    handleError(500, err);
  }
};

// fetching the timeline 
export const getAllTweets = async (req, res, next) => {
  try {
    // finding the current user by their id
    const currentUser = await User.findById(req.params.id);
    // fetching the user's tweets
    const userTweets = await Tweet.find({ userId: currentUser._id });
    const followersTweets = await Promise.all(
      // fetching tweets from users they follow
      currentUser.following.map((followerId) => {
        return Tweet.find({ userId: followerId });
      })
    );
    // combining the tweets
    res.status(200).json(userTweets.concat(...followersTweets));
  } catch (err) {
    handleError(500, err);
  }
};

// fetching a specific user's tweets
export const getUserTweets = async (req, res, next) => {
  try {
    const userTweets = await Tweet.find({ userId: req.params.id }).sort({
      // sorting tweets by recency
      createAt: -1,
    });

    res.status(200).json(userTweets);
  } catch (err) {
    handleError(500, err);
  }
};

// fetching all tweets for the explore page
export const getExploreTweets = async (req, res, next) => {
  try {
    const getExploreTweets = await Tweet.find({
      // finding all tweets that have at least one like
      likes: { $exists: true },
      //sorting them by likes
    }).sort({ likes: -1 });

    res.status(200).json(getExploreTweets);
  } catch (err) {
    handleError(500, err);
  }
};

// searching tweets by content
export const searchTweets = async (req, res, next) => {
  try {
    const { query } = req.query;
    
    if (!query || query.trim() === '') {
      return res.status(400).json({ message: "Search query is required" });
    }

    // Create case-insensitive regex pattern
    const searchRegex = new RegExp(query.trim(), 'i');
    
    // Search tweets by description content
    const searchResults = await Tweet.find({
      description: { $regex: searchRegex }
    }).sort({ createdAt: -1 }); // Sort by newest first

    res.status(200).json(searchResults);
  } catch (err) {
    console.error("Search error:", err);
    handleError(500, err);
  }
};

// searching tweets by hashtag
export const searchByHashtag = async (req, res, next) => {
  try {
    const { hashtag } = req.params;
    
    if (!hashtag) {
      return res.status(400).json({ message: "Hashtag is required" });
    }

    // Remove # if present and convert to lowercase
    const cleanHashtag = hashtag.replace('#', '').toLowerCase();
    
    // Search tweets by hashtag
    const hashtagResults = await Tweet.find({
      hashtags: cleanHashtag
    }).sort({ createdAt: -1 }); // Sort by newest first

    res.status(200).json(hashtagResults);
  } catch (err) {
    console.error("Hashtag search error:", err);
    handleError(500, err);
  }
};

// get trending hashtags
export const getTrendingHashtags = async (req, res, next) => {
  try {
    // Aggregate to get hashtag counts
    const trendingHashtags = await Tweet.aggregate([
      { $unwind: "$hashtags" },
      {
        $group: {
          _id: "$hashtags",
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.status(200).json(trendingHashtags);
  } catch (err) {
    console.error("Trending hashtags error:", err);
    handleError(500, err);
  }
};
