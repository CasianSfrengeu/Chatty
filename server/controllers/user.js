/*
This controller handles user functions such as:

-fetching user data
-updating user information
-deleting users
-following/unfollowing users

*/

// importing User and Tweet, to fetch the user data and remove a user's tweets when the user is deleted
import { handleError } from "../error.js";
import User from "../models/User.js";
import Tweet from "../models/Tweet.js";


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
    const { action } = req.body; // 'accept' or 'reject'
    const currentUser = await User.findById(req.params.id);
    const requestingUser = await User.findById(req.body.requestingUserId);

    if (!currentUser) {
      return res.status(404).json("Current user not found");
    }

    if (!requestingUser) {
      return res.status(404).json("Requesting user not found");
    }

    // Check if the requesting user is in the current user's pending followers
    if (!currentUser.pendingFollowers || !currentUser.pendingFollowers.includes(req.body.requestingUserId)) {
      return res.status(404).json("No pending follow request found");
    }

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
      res.status(200).json("Follow request accepted");
    } else {
      res.status(200).json("Follow request rejected");
    }
  } catch (err) {
    next(err);
  }
};

export const deleteUser = async (req, res, next) => {
  // checking if the user is authorized
  if (req.params.id === req.user.id) {
    try {
      // finding the user by id and deleting all of their tweets
      await User.findByIdAndDelete(req.params.id);
      await Tweet.remove({ userId: req.params.id });

      // we return a message if the actions succeeds
      res.status(200).json("User delete");
    // error handling
    } catch (err) {
      next(err);
    }
  } else {
    return next(handleError(403, "You can only update your own account"));
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

