import React, { useState, useEffect } from "react";
import LeftSidebar from "../../components/LeftSidebar/LeftSidebar";
import RightSidebar from "../../components/RightSidebar/RightSidebar";
import EditProfile from "../../components/EditProfile/EditProfile";

import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import api from "../../api";
import Tweet from "../../components/Tweet/Tweet";

import { following } from "../../redux/userSlice";

/*

 This component displays the user's profile page (their tweets and profile information)
  -it also allows users to follow/unfollow the profile they're currently looking at
  -enables editing the profile (if viewing their own profile)

 */
const Profile = () => {
  const [open, setOpen] = useState(false);
  const { currentUser } = useSelector((state) => state.user);
  const [userTweets, setUserTweets] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [hasRequestedFollow, setHasRequestedFollow] = useState(false);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [followModal, setFollowModal] = useState(null); // "following" | "followers" | null
  const [followModalUsers, setFollowModalUsers] = useState([]);
  const [followModalLoading, setFollowModalLoading] = useState(false);

  const { id } = useParams(); // extracting the user id
  const dispatch = useDispatch();
  const navigate = useNavigate();

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

  // Open follow modal and fetch user details
  const openFollowModal = async (type) => {
    setFollowModal(type);
    setFollowModalLoading(true);
    setFollowModalUsers([]);
    const ids = type === "following" ? userProfile.following : userProfile.followers;
    try {
      const users = await Promise.all(
        (ids || []).map((uid) => api.get(`/users/find/${uid}`).then((r) => r.data).catch(() => null))
      );
      setFollowModalUsers(users.filter(Boolean));
    } catch {}
    setFollowModalLoading(false);
  };

  // Message button handler
  const handleMessage = async () => {
    // Optionally, you could create the conversation here if it doesn't exist
    navigate("/chat", { state: { userId: userProfile._id, username: userProfile.username } });
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
                  src={userProfile.profilePicture || "/default-avatar.svg"}
                  alt="Profile"
                  className="w-24 h-24 rounded-full border-4 border-orange-200 shadow-md object-cover"
                  onError={e => { e.target.onerror = null; e.target.src = "/default-avatar.svg"; }}
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
                  <button
                    onClick={() => openFollowModal("following")}
                    className="flex flex-col items-center hover:text-orange-500 transition-colors cursor-pointer"
                  >
                    <span className="font-semibold text-gray-800 text-base">{userProfile.following?.length || 0}</span>
                    <span>Following</span>
                  </button>
                  <button
                    onClick={() => openFollowModal("followers")}
                    className="flex flex-col items-center hover:text-orange-500 transition-colors cursor-pointer"
                  >
                    <span className="font-semibold text-gray-800 text-base">{userProfile.followers?.length || 0}</span>
                    <span>Followers</span>
                  </button>
                </div>

                {/* Follow & Edit Profile Button */}
                <div className="flex gap-3 justify-center">
                  <button
                    className={followButtonProps.className}
                    onClick={followButtonProps.onClick}
                    disabled={!followButtonProps.onClick}
                  >
                    {followButtonProps.text}
                  </button>
                  {/* Message Button: only show if not own profile */}
                  {!isOwnProfile && (
                    <button
                      className="px-4 py-2 bg-orange-100 text-orange-600 rounded-full font-semibold hover:bg-orange-200 transition border border-orange-200"
                      onClick={handleMessage}
                    >
                      Message
                    </button>
                  )}
                </div>
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

      {/* Following / Followers Modal */}
      {followModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setFollowModal(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-orange-100">
              <h3 className="text-lg font-bold text-gray-800 capitalize">{followModal}</h3>
              <button
                onClick={() => setFollowModal(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              >
                &times;
              </button>
            </div>

            {/* Modal Body */}
            <div className="max-h-96 overflow-y-auto divide-y divide-orange-50">
              {followModalLoading ? (
                <div className="flex justify-center items-center py-10 text-orange-400 font-medium">
                  Loading...
                </div>
              ) : followModalUsers.length === 0 ? (
                <div className="flex justify-center items-center py-10 text-gray-400">
                  No users yet.
                </div>
              ) : (
                followModalUsers.map((user) => (
                  <button
                    key={user._id}
                    onClick={() => { setFollowModal(null); navigate(`/profile/${user._id}`); }}
                    className="w-full flex items-center gap-4 px-6 py-4 hover:bg-orange-50 transition-colors text-left"
                  >
                    <img
                      src={user.profilePicture || "/default-avatar.svg"}
                      alt={user.username}
                      className="w-11 h-11 rounded-full object-cover border-2 border-orange-100 shrink-0"
                      onError={e => { e.target.onerror = null; e.target.src = "/default-avatar.svg"; }}
                    />
                    <div className="flex flex-col min-w-0">
                      <span className="font-semibold text-gray-800 truncate">{user.username}</span>
                      {user.biography && (
                        <span className="text-sm text-gray-500 truncate">{user.biography}</span>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Profile;
