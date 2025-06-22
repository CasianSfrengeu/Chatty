import React, { useState, useEffect } from "react";
import api from "../../api";
import { useDispatch, useSelector } from "react-redux";
import { changeProfile, logout } from "../../redux/userSlice";
import { useNavigate } from "react-router-dom";

const EditProfile = ({ setOpen }) => {
  // 
  const { currentUser } = useSelector((state) => state.user);

  // storing the selected image file
  const [img, setImg] = useState(null);

  // tracking the profress of the image upload
  const [imgUploadProgress, setImgUploadProgress] = useState(0);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  //image upload function
  const uploadImg = async (file) => {
    // uploading the selected image using a FormData object
    try {
      const formData = new FormData();
      formData.append("image", file);

      // PUT request to update the profile picture
      const res = await api.put(`/users/${currentUser._id}/profile`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });


      // dispatching an action to update the profile pic
      dispatch(changeProfile(res.data.profilePicture));
    // error handling
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };

  // profile deletion function
  const handleDelete = async () => {
    try {
      // using a DELETE request to remove the user's account from the DB
      await api.delete(`/users/${currentUser._id}`);
      // dispatching the logout action
      dispatch(logout());
      // if the request is successful the user gets redirected to the signin page
      navigate("/signin");
    } catch (error) {
      console.error("Error deleting account:", error);
    }
  };

  // whenever img changes the upload function is automatically triggered
  useEffect(() => {
    if (img) uploadImg(img);
  }, [img]);

  return (
    <div className="fixed inset-0 bg-orange-50 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white shadow-lg rounded-lg p-6 w-[90%] max-w-lg relative">
        <button
          onClick={() => setOpen(false)}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 transition duration-200"
        >
          ✕
        </button>

        {/* Header */}
        <h2 className="text-2xl font-extrabold text-orange-500 text-center mb-6">
          Edit Profile
        </h2>

        {/* Profile Picture Section */}
        <div className="space-y-4">
          <p className="text-gray-600">Choose a new profile picture</p>
          {imgUploadProgress > 0 ? (
            <p className="text-orange-500 font-semibold">
              Uploading: {imgUploadProgress}%
            </p>
          ) : (
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImg(e.target.files[0])}
              className="w-full px-4 py-3 border border-orange-300 rounded-lg focus:outline-none focus:ring focus:ring-orange-500 focus:border-orange-500"
            />
          )}
        </div>

        {/* Account Deletion Section */}
        <div className="mt-8">
          <p className="text-gray-600 mb-4">Want to delete your account?</p>
          <button
            onClick={handleDelete}
            className="w-full bg-red-500 text-white py-3 rounded-lg font-semibold hover:bg-red-600 transition duration-300"
          >
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
