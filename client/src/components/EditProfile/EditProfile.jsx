import React, { useState, useEffect } from "react";
import api from "../../api";
import { useDispatch, useSelector } from "react-redux";
import { changeProfile, logout } from "../../redux/userSlice";
import { useNavigate } from "react-router-dom";

const EditProfile = ({ setOpen }) => {
  const { currentUser } = useSelector((state) => state.user);
  const [img, setImg] = useState(null);
  const [imgUploadProgress, setImgUploadProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  // New form fields
  const [formData, setFormData] = useState({
    biography: currentUser?.biography || "",
    backgroundColor: currentUser?.backgroundColor || "#FF6B35",
    isPrivate: currentUser?.isPrivate || false,
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Predefined color options
  const colorOptions = [
    "#FF6B35", "#FF8E53", "#FFB366", "#FFD93D", "#6BCF7F", 
    "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7", "#DDA0DD",
    "#98D8C8", "#F7DC6F", "#BB8FCE", "#85C1E9", "#F8C471"
  ];

  // Image upload function
  const uploadImg = async (file) => {
    try {
      setImgUploadProgress(10);
      const formData = new FormData();
      formData.append("image", file);

      const res = await api.put(`/users/${currentUser._id}/profile`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setImgUploadProgress(progress);
        },
      });

      dispatch(changeProfile(res.data));
      setImgUploadProgress(0);
      setMessage("Profile picture updated successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Error uploading image:", error);
      setMessage("Error uploading image");
      setImgUploadProgress(0);
    }
  };

  // Update profile information
  const handleUpdateProfile = async () => {
    try {
      setIsLoading(true);
      const res = await api.put(`/users/${currentUser._id}`, formData);
      dispatch(changeProfile(res.data));
      setMessage("Profile updated successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage("Error updating profile");
    } finally {
      setIsLoading(false);
    }
  };

  // Profile deletion function
  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      try {
        await api.delete(`/users/${currentUser._id}`);
        dispatch(logout());
        navigate("/signin");
      } catch (error) {
        console.error("Error deleting account:", error);
        setMessage("Error deleting account");
      }
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle color selection
  const handleColorSelect = (color) => {
    setFormData(prev => ({
      ...prev,
      backgroundColor: color
    }));
  };

  // whenever img changes the upload function is automatically triggered
  useEffect(() => {
    if (img) uploadImg(img);
  }, [img]);

  return (
    <div className="fixed inset-0 bg-orange-50 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="modal relative max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <button
          onClick={() => setOpen(false)}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 transition duration-200 text-2xl z-10"
        >
          ✕
        </button>

        {/* Header */}
        <h2 className="text-2xl font-extrabold text-orange-500 text-center mb-6">
          Edit Profile
        </h2>

        {/* Message Display */}
        {message && (
          <div className={`mb-4 p-3 rounded-xl text-center font-semibold ${
            message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
          }`}>
            {message}
          </div>
        )}

        {/* Profile Picture Section */}
        <div className="card mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Profile Picture</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <img
                src={currentUser?.profilePicture || "/default-avatar.png"}
                alt="Current Profile"
                className="w-16 h-16 rounded-full border-2 border-orange-200 shadow-md object-cover"
              />
              <div className="flex-1">
                {imgUploadProgress > 0 ? (
                  <div className="space-y-2">
                    <p className="text-orange-500 font-semibold">
                      Uploading: {imgUploadProgress}%
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${imgUploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                ) : (
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImg(e.target.files[0])}
                    className="w-full px-4 py-3 border border-orange-200 rounded-xl focus:outline-none focus:ring focus:ring-orange-400"
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Biography Section */}
        <div className="card mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Biography</h3>
          <textarea
            name="biography"
            value={formData.biography}
            onChange={handleInputChange}
            placeholder="Tell us about yourself..."
            maxLength={500}
            className="w-full px-4 py-3 border border-orange-200 rounded-xl focus:outline-none focus:ring focus:ring-orange-400 resize-none"
            rows={4}
          />
          <p className="text-sm text-gray-500 mt-2">
            {formData.biography.length}/500 characters
          </p>
        </div>

        {/* Background Color Section */}
        <div className="card mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Profile Theme Color</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div 
                className="w-8 h-8 rounded-full border-2 border-gray-300"
                style={{ backgroundColor: formData.backgroundColor }}
              ></div>
              <span className="text-sm text-gray-600">{formData.backgroundColor}</span>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {colorOptions.map((color) => (
                <button
                  key={color}
                  onClick={() => handleColorSelect(color)}
                  className={`w-10 h-10 rounded-full border-2 transition-all hover:scale-110 ${
                    formData.backgroundColor === color ? 'border-gray-800' : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: color }}
                  title={color}
                ></button>
              ))}
            </div>
          </div>
        </div>

        {/* Privacy Settings Section */}
        <div className="card mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Privacy Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <h4 className="font-semibold text-gray-800">Private Account</h4>
                <p className="text-sm text-gray-600">
                  {formData.isPrivate 
                    ? "Only approved followers can see your posts" 
                    : "Anyone can see your posts and follow you"
                  }
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="isPrivate"
                  checked={formData.isPrivate}
                  onChange={handleInputChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={handleUpdateProfile}
            disabled={isLoading}
            className="flex-1 orange-gradient text-white py-3 rounded-xl font-semibold hover:scale-105 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Updating..." : "Save Changes"}
          </button>
          <button
            onClick={() => setOpen(false)}
            className="flex-1 bg-gray-500 text-white py-3 rounded-xl font-semibold hover:bg-gray-600 transition"
          >
            Cancel
          </button>
        </div>

        {/* Account Deletion Section */}
        <div className="card border-red-200 bg-red-50">
          <h3 className="text-lg font-semibold text-red-700 mb-4">Danger Zone</h3>
          <p className="text-red-600 mb-4">Once you delete your account, there is no going back. Please be certain.</p>
          <button
            onClick={handleDelete}
            className="w-full bg-red-500 text-white py-3 rounded-xl font-semibold hover:bg-red-600 transition duration-300"
          >
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
