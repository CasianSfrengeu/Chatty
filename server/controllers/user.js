/*
This controller handles user functions such as:

-fetching user data
-updating user information
-deleting users
-following/unfollowing users

*/

import { handleError } from "../error.js";
import User from "../models/User.js";
import Tweet from "../models/Tweet.js";
import Message from "../models/Message.js";
import Conversation from "../models/Conversation.js";


export const getUser = async (req, res, next) => {
  try {
    // finding the user by their Id and returning the data as JSON
    const user = await User.findById(req.params.id);
    res.status(200).json(user);
  // error handling
  } catch (err) {
    next(err);
  }
};

export const update = async (req, res, next) => {
  // checking if the request is from the account owner
  if (req.params.id === req.user.id) {
    try {
      // updating the profile
      const updatedUser = await User.findByIdAndUpdate(
        req.params.id,
        {
          $set: req.body,
        },
        {
          new: true,
        }
      );
      // updated  data returned as json
      res.status(200).json(updatedUser);
    // error handling
    } catch (err) {
      next(err);
    }
  } else {
    return next(createError(403, "You can update only your account"));
  }
};

// New function to handle follow requests for private accounts
export const requestFollow = async (req, res, next) => {
  try {
    const userToFollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.body.id);

    if (!userToFollow) {
      return res.status(404).json("User not found");
    }

    // If user is private, add to pending followers
    if (userToFollow.isPrivate) {
      if (!userToFollow.pendingFollowers.includes(req.body.id)) {
        await userToFollow.updateOne({
          $push: { pendingFollowers: req.body.id },
        });

        const io = req.app.get("io");
        const socketUsers = req.app.get("socketUsers");
        const targetSocketId = socketUsers?.get(String(req.params.id));
        if (io && targetSocketId) {
          io.to(targetSocketId).emit("followRequest", {
            requestingUserId: req.body.id,
          });
        }

        res.status(200).json("Follow request sent");
      } else {
        res.status(403).json("Follow request already sent");
      }
    } else {
      // If public, follow directly
      if (!userToFollow.followers.includes(req.body.id)) {
        await userToFollow.updateOne({
          $push: { followers: req.body.id },
        });
        await currentUser.updateOne({ $push: { following: req.params.id } });
        res.status(200).json("Following the user");
      } else {
        res.status(403).json("You already follow this user");
      }
    }
  } catch (err) {
    next(err);
  }
};

// New function to handle follow request responses
export const respondToFollowRequest = async (req, res, next) => {
  try {
    console.log("🔍 respondToFollowRequest called with:", {
      params: req.params,
      body: req.body,
      user: req.user
    });

    const { action } = req.body; // 'accept' or 'reject'
    const currentUser = await User.findById(req.params.id);
    const requestingUser = await User.findById(req.body.requestingUserId);

    console.log("🔍 Found users:", {
      currentUser: currentUser ? { id: currentUser._id, pendingFollowers: currentUser.pendingFollowers } : null,
      requestingUser: requestingUser ? { id: requestingUser._id } : null
    });

    if (!currentUser) {
      return res.status(404).json("Current user not found");
    }

    if (!requestingUser) {
      return res.status(404).json("Requesting user not found");
    }

    // Initialize pendingFollowers if it doesn't exist
    if (!currentUser.pendingFollowers) {
      currentUser.pendingFollowers = [];
      await currentUser.save();
    }

    // Check if the requesting user is in the current user's pending followers
    if (!currentUser.pendingFollowers.includes(req.body.requestingUserId)) {
      console.log("❌ No pending follow request found. Current pendingFollowers:", currentUser.pendingFollowers);
      return res.status(404).json("No pending follow request found");
    }

    console.log("✅ Found pending follow request, processing...");

    // Remove from pending followers
    await currentUser.updateOne({
      $pull: { pendingFollowers: req.body.requestingUserId },
    });

    if (action === 'accept') {
      // Add to followers and following
      await currentUser.updateOne({
        $push: { followers: req.body.requestingUserId },
      });
      await requestingUser.updateOne({
        $push: { following: req.params.id },
      });
      console.log("✅ Follow request accepted");
      res.status(200).json("Follow request accepted");
    } else {
      console.log("✅ Follow request rejected");
      res.status(200).json("Follow request rejected");
    }
  } catch (err) {
    console.error("❌ Error in respondToFollowRequest:", err);
    next(err);
  }
};

export const deleteUser = async (req, res, next) => {
  if (req.params.id !== req.user.id) {
    return next(handleError(403, "You can only delete your own account"));
  }
  try {
    const userId = req.params.id;

    // Delete all tweets by the user
    await Tweet.deleteMany({ userId });

    // Delete all messages sent by the user
    await Message.deleteMany({ sender: userId });

    // Delete all conversations the user is part of (and their messages)
    const conversations = await Conversation.find({ members: userId });
    const convIds = conversations.map((c) => c._id);
    if (convIds.length > 0) {
      await Message.deleteMany({ conversationId: { $in: convIds } });
      await Conversation.deleteMany({ _id: { $in: convIds } });
    }

    // Remove user from other users' followers/following arrays
    await User.updateMany(
      { $or: [{ followers: userId }, { following: userId }, { pendingFollowers: userId }] },
      { $pull: { followers: userId, following: userId, pendingFollowers: userId } }
    );

    // Finally delete the user
    await User.findByIdAndDelete(userId);

    res.status(200).json("Account deleted successfully");
  } catch (err) {
    next(err);
  }
};

export const follow = async (req, res, next) => {
  try {
    // finding the user being followed and the current user by id
    const user = await User.findById(req.params.id);
    const currentUser = await User.findById(req.body.id);

    // checking if the user is already followed by the current user
    if (!user.followers.includes(req.body.id)) {
      // we add the current user to the user's followers array
      await user.updateOne({
        $push: { followers: req.body.id },
      });
      // adding the user to the current user's following array
      await currentUser.updateOne({ $push: { following: req.params.id } });
    // error and exception handling
    } else {
      res.status(403).json("you already follow this user");
    }
    res.status(200).json("following the user");
  } catch (err) {
    next(err);
  }
};


export const unFollow = async (req, res, next) => {
  try {
    // find user and current user by Id
    const user = await User.findById(req.params.id);
    const currentUser = await User.findById(req.body.id);

    // if the current user follows the user, they will be removed from the user's followers array
    if (currentUser.following.includes(req.params.id)) {
      await user.updateOne({
        $pull: { followers: req.body.id },
      });
      // removing user from current user's following array
      await currentUser.updateOne({ $pull: { following: req.params.id } });

    // error and exception handling
    } else {
      res.status(403).json("you are not following this user");
    }
    res.status(200).json("unfollowing the user");
  } catch (err) {
    next(err);
  }
};


// fetch user by username instead of id
export const getUserByUsername = async (req, res, next) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) {
      return res.status(404).json("User not found");
    }
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
};

