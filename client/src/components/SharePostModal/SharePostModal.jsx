import React, { useState, useEffect } from "react";
import api from "../../api";
import { useSelector } from "react-redux";

const SharePostModal = ({ isOpen, onClose, postId, postDescription }) => {
  const { currentUser } = useSelector((state) => state.user);
  const [followers, setFollowers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [sharing, setSharing] = useState(false);

  // Fetch user's followers
  useEffect(() => {
    if (isOpen && currentUser) {
      fetchFollowers();
    }
  }, [isOpen, currentUser]);

  const fetchFollowers = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/users/followers/${currentUser._id}`);
      setFollowers(res.data);
    } catch (err) {
      console.log("Error fetching followers:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!selectedUser) return;

    try {
      setSharing(true);
      
      // Find or create conversation with selected user
      const conversationRes = await api.post("/conversations", {
        senderId: currentUser._id,
        receiverId: selectedUser._id,
      });

      // Share the post
      await api.post("/messages/share-post", {
        conversationId: conversationRes.data._id,
        postId: postId,
        receiverId: selectedUser._id,
      });

      onClose();
      setSelectedUser(null);
    } catch (err) {
      console.log("Error sharing post:", err);
    } finally {
      setSharing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-orange-500">Share Post</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Post preview */}
        <div className="bg-orange-50 p-3 rounded-lg mb-4">
          <p className="text-sm text-gray-600 mb-2">Post preview:</p>
          <p className="text-gray-800">{postDescription}</p>
        </div>

        {/* Followers list */}
        <div className="mb-4">
          <h3 className="text-lg font-medium text-gray-700 mb-3">
            Share with:
          </h3>
          
          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500 mx-auto"></div>
            </div>
          ) : followers.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              You don't have any followers yet.
            </p>
          ) : (
            <div className="max-h-60 overflow-y-auto space-y-2">
              {followers.map((follower) => (
                <div
                  key={follower._id}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition ${
                    selectedUser?._id === follower._id
                      ? "bg-orange-100 border-2 border-orange-300"
                      : "bg-gray-50 hover:bg-gray-100"
                  }`}
                  onClick={() => setSelectedUser(follower)}
                >
                  <img
                    src={follower.profilePicture || "/default-avatar.png"}
                    alt="avatar"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">
                      {follower.username}
                    </p>
                    <p className="text-sm text-gray-500">
                      {follower.biography || "No bio"}
                    </p>
                  </div>
                  {selectedUser?._id === follower._id && (
                    <div className="text-orange-500">✓</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleShare}
            disabled={!selectedUser || sharing}
            className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sharing ? "Sharing..." : "Share"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SharePostModal; 