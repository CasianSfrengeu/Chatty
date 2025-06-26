import React, { useState, useEffect } from "react";
import LeftSidebar from "../../components/LeftSidebar/LeftSidebar";
import RightSidebar from "../../components/RightSidebar/RightSidebar";
import EditProfile from "../../components/EditProfile/EditProfile";

import { useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import api from "../../api";
import Tweet from "../../components/Tweet/Tweet";

import { following, addFollowRequest } from "../../redux/userSlice";

/*

 This component displays the user's profile page (their tweets and profile information)
  -it also allows users to follow/unfollow the profile they're currently looking at
  -enables editing the profile (if viewing their own profile)

 */
const Profile = () => {
  const [open, setOpen] = useState(false);
  const { currentUser } = useSelector((state) => state.user);
  const [userTweets, setUserTweets] = useState([]); // storing user's tweets
  const [userProfile, setUserProfile] = useState(null); // storing user profile information
  const [isFollowing, setIsFollowing] = useState(false);
  const [hasRequestedFollow, setHasRequestedFollow] = useState(false);
  const [isOwnProfile, setIsOwnProfile] = useState(false);

  const { id } = useParams(); // extracting the user id
  const dispatch = useDispatch();

  // fetching the user profile and tweets with GET requests
  useEffect(() => {
    const fetchData = async () => {
      try {
        const userTweets = await api.get(`/tweets/user/all/${id}`);
        const userProfile = await api.get(`/users/find/${id}`);

        setUserTweets(Array.isArray(userTweets.data) ? userTweets.data : []);
        setUserProfile(userProfile.data);
        
        // Check if current user is following this profile
        setIsFollowing(currentUser.following.includes(id));
        setHasRequestedFollow(userProfile.data.pendingFollowers?.includes(currentUser._id) || false);
        setIsOwnProfile(currentUser._id === id);
      } catch (err) {
        console.log("error", err);
        setUserTweets([]);
      }
    };

    fetchData();
  }, [currentUser, id]);

  // follow/unfollow functionality
  const handleFollow = async () => {
    try {
      if (userProfile.isPrivate) {
        // Handle private account follow request
        if (!hasRequestedFollow) {
          await api.put(`/users/request-follow/${id}`, { id: currentUser._id });
          setHasRequestedFollow(true);
          // Update Redux state to add to pending followers
          dispatch(addFollowRequest(currentUser._id));
        }
      } else {
        // Handle public account follow/unfollow
        if (!isFollowing) {
          await api.put(`/users/follow/${id}`, { id: currentUser._id });
          dispatch(following(id));
          setIsFollowing(true);
        } else {
          await api.put(`/users/unfollow/${id}`, { id: currentUser._id });
          dispatch(following(id));
          setIsFollowing(false);
        }
      }
    } catch (err) {
      console.log("error", err);
    }
  };

  // Get follow button text and styling
  const getFollowButtonProps = () => {
    if (isOwnProfile) {
      return {
        text: "Edit Profile",
        className: "px-4 py-2 orange-gradient text-white rounded-full font-semibold hover:scale-105 transition",
        onClick: () => setOpen(true)
      };
    }

    if (userProfile?.isPrivate) {
      if (hasRequestedFollow) {
        return {
          text: "Request Sent",
          className: "px-4 py-2 bg-gray-400 text-white rounded-full font-semibold cursor-not-allowed",
          onClick: null
        };
      } else {
        return {
          text: "Request Follow",
          className: "px-4 py-2 orange-gradient text-white rounded-full font-semibold hover:scale-105 transition",
          onClick: handleFollow
        };
      }
    } else {
      if (isFollowing) {
        return {
          text: "Following",
          className: "px-4 py-2 bg-gray-500 text-white rounded-full font-semibold hover:bg-gray-600 transition",
          onClick: handleFollow
        };
      } else {
        return {
          text: "Follow",
          className: "px-4 py-2 orange-gradient text-white rounded-full font-semibold hover:scale-105 transition",
          onClick: handleFollow
        };
      }
    }
  };

  const followButtonProps = getFollowButtonProps();

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-4 min-h-screen mt-[60px]">
        {/* Sidebar */}
        <div className="hidden md:flex md:flex-col md:w-[250px] px-4">
          <LeftSidebar />
        </div>

        {/* Profile Section */}
        <div className="col-span-2 flex flex-col items-center p-6 bg-orange-50 border-x border-orange-200 shadow-md min-h-screen">
          <div className="w-full max-w-2xl">
            {userProfile && (
              <div 
                className="card mb-6 flex flex-col items-center text-center gap-4 relative overflow-hidden"
                style={{ 
                  background: `linear-gradient(135deg, ${userProfile.backgroundColor}15, ${userProfile.backgroundColor}08)`,
                  borderColor: `${userProfile.backgroundColor}30`
                }}
              >
                {/* Privacy Badge */}
                {userProfile.isPrivate && (
                  <div className="absolute top-4 right-4 bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                    <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                    Private
                  </div>
                )}

                <img
                  src={userProfile.profilePicture || "/default-avatar.png"}
                  alt="Profile"
                  className="w-24 h-24 rounded-full border-4 border-orange-200 shadow-md object-cover"
                />
                <h2 className="text-2xl font-bold text-orange-500">
                  {userProfile.username}
                </h2>
                <p className="text-gray-600">@{userProfile.username}</p>

                {/* Biography */}
                {userProfile.biography && (
                  <p className="text-gray-700 max-w-md leading-relaxed">
                    {userProfile.biography}
                  </p>
                )}

                {/* Follow Stats */}
                <div className="flex gap-6 text-sm text-gray-600">
                  <span className="flex flex-col">
                    <span className="font-semibold text-gray-800">{userProfile.following?.length || 0}</span>
                    <span>Following</span>
                  </span>
                  <span className="flex flex-col">
                    <span className="font-semibold text-gray-800">{userProfile.followers?.length || 0}</span>
                    <span>Followers</span>
                  </span>
                </div>

                {/* Follow & Edit Profile Button */}
                <button
                  className={followButtonProps.className}
                  onClick={followButtonProps.onClick}
                  disabled={!followButtonProps.onClick}
                >
                  {followButtonProps.text}
                </button>
              </div>
            )}

            {/* User Tweets */}
            <div className="w-full space-y-6">
              {userTweets &&
                userTweets.map((tweet) => (
                  <div className="card" key={tweet._id}>
                    <Tweet tweet={tweet} setData={setUserTweets} />
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="hidden md:block px-4">
          <RightSidebar />
        </div>
      </div>

      {/* Edit Profile Modal */}
      {open && <EditProfile setOpen={setOpen} />}
    </>
  );
};

export default Profile;
