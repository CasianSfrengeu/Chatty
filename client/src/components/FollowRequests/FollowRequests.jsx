import React, { useState, useEffect } from "react";
import api from "../../api";
import { useSelector, useDispatch } from "react-redux";
import { removeFollowRequest } from "../../redux/userSlice";

const FollowRequests = ({ isOpen, onClose }) => {
  const { currentUser } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const [pendingFollowers, setPendingFollowers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && currentUser?.pendingFollowers?.length > 0) {
      fetchPendingFollowers();
    }
  }, [isOpen, currentUser]);

  const fetchPendingFollowers = async () => {
    try {
      setIsLoading(true);
      const promises = currentUser.pendingFollowers.map(userId => 
        api.get(`/users/find/${userId}`)
      );
      const responses = await Promise.all(promises);
      setPendingFollowers(responses.map(res => res.data));
    } catch (error) {
      console.error("Error fetching pending followers:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFollowRequest = async (requestingUserId, action) => {
    try {
      await api.put(`/users/respond-follow-request/${currentUser._id}`, {
        requestingUserId,
        action
      });
      
      // Remove from pending followers list
      setPendingFollowers(prev => prev.filter(user => user._id !== requestingUserId));
      
      // Update Redux store
      dispatch(removeFollowRequest(requestingUserId));
      
    } catch (error) {
      console.error("Error responding to follow request:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-orange-50 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="modal relative max-w-md w-full">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 transition duration-200 text-2xl"
        >
          ✕
        </button>

        <div className="card">
          <h2 className="text-2xl font-extrabold text-orange-500 text-center mb-6">
            Follow Requests
          </h2>

          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading...</p>
            </div>
          ) : pendingFollowers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No pending follow requests</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingFollowers.map((user) => (
                <div key={user._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <img
                      src={user.profilePicture || "/default-avatar.png"}
                      alt={user.username}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-semibold text-gray-800">{user.username}</p>
                      <p className="text-sm text-gray-600">@{user.username}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleFollowRequest(user._id, 'accept')}
                      className="px-3 py-1 bg-green-500 text-white rounded-full text-sm font-semibold hover:bg-green-600 transition"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleFollowRequest(user._id, 'reject')}
                      className="px-3 py-1 bg-red-500 text-white rounded-full text-sm font-semibold hover:bg-red-600 transition"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FollowRequests; 