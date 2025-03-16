// This page handles the user login by interacting with the redux store and an authentication API

// useState handles form input values (username, password etc)
import React, { useState } from "react";

// importing axios for more convenient API requests
import axios from "axios";

// useDispatch allows dispatching actions to the Redux store
import { useDispatch } from "react-redux";

// importing the redux actions that deal with the authentication
import { loginStart, loginSuccess, loginFailed } from "../../redux/userSlice";

// userNavigate redirects the user after a successful login
import { useNavigate } from "react-router-dom";


const Signin = () => {
  //storing the email, username and password input
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");

  // triggers redux actions
  const dispatch = useDispatch();
  // redirects the user
  const navigate = useNavigate();
  
  // login function
  const handleLogin = async (e) => {
    // prevents the submission of the default form
    e.preventDefault();

    // activates the loginStart action (isLoading now true)
    dispatch(loginStart());
    try {
      // sends a POST request to /auth/signin with the username and password
      const res = await axios.post("/auth/signin", { username, password });
      // if successful, the loginSuccess action is dispatched, the user is stored and redirected to the home page
      dispatch(loginSuccess(res.data));
      navigate("/");
    } catch (err) {
      // if the request fails, the loginFailed action is dispatched and "error" becomes true
      dispatch(loginFailed());
    }
  };

  //signup function
  const handleSignup = async (e) => {
    e.preventDefault();
    dispatch(loginStart());

    // same as the login function, except the request also contains the user's email
    try {
      const res = await axios.post("/auth/signup", {
        username,
        email,
        password,
      });
      dispatch(loginSuccess(res.data));
      navigate("/");
    } catch (err) {
      dispatch(loginFailed());
    }
  };

  // Interface
  return (
    <div className="min-h-screen bg-orange-50 flex items-center justify-center mt-[60px]">
      <div className="bg-white shadow-lg rounded-lg p-8 w-[90%] max-w-lg">
        {/* App Title */}
        <h2 className="text-3xl font-extrabold text-orange-500 text-center mb-4">
          Welcome to Chatty
        </h2>
        <p className="text-center text-gray-500 mb-8">
          Connect and share your thoughts with the world.
        </p>


        {/* Sign In Form */}
        <form className="space-y-6">
          {/* Input: Username */}
          <input
            type="text"
            placeholder="Username"
            className="w-full px-4 py-3 border border-orange-300 rounded-lg focus:outline-none focus:ring focus:ring-orange-500 focus:border-orange-500"
            onChange={(e) => setUsername(e.target.value)}
          />
          {/* Input: Password */}
          <input
            type="password"
            placeholder="Password"
            className="w-full px-4 py-3 border border-orange-300 rounded-lg focus:outline-none focus:ring focus:ring-orange-500 focus:border-orange-500"
            onChange={(e) => setPassword(e.target.value)}
          />
          {/* Sign In Button */}
          <button
            onClick={handleLogin}
            className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition duration-300"
          >
            Sign In
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <span className="absolute inset-x-0 top-2/4 transform -translate-y-2/4 h-[1px] bg-gray-300"></span>
          <span className="bg-white px-4 text-gray-500 relative text-sm">or</span>
        </div>

        {/* Sign Up Form */}
        <form className="space-y-6">
          {/* Input: Username */}
          <input
            type="text"
            placeholder="Username"
            className="w-full px-4 py-3 border border-orange-300 rounded-lg focus:outline-none focus:ring focus:ring-orange-500 focus:border-orange-500"
            onChange={(e) => setUsername(e.target.value)}
          />
          {/* Input: Email */}
          <input
            type="email"
            placeholder="Email"
            className="w-full px-4 py-3 border border-orange-300 rounded-lg focus:outline-none focus:ring focus:ring-orange-500 focus:border-orange-500"
            onChange={(e) => setEmail(e.target.value)}
          />
          {/* Input: Password */}
          <input
            type="password"
            placeholder="Password"
            className="w-full px-4 py-3 border border-orange-300 rounded-lg focus:outline-none focus:ring focus:ring-orange-500 focus:border-orange-500"
            onChange={(e) => setPassword(e.target.value)}
          />
          {/* Sign Up Button */}
          <button
            onClick={handleSignup}
            className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition duration-300"
          >
            Sign Up
          </button>
        </form>
      </div>
    </div>
  );
};

export default Signin;
