import React, { useState } from "react";
import api from "../../api";
import { useDispatch } from "react-redux";
import { loginStart, loginSuccess, loginFailed } from "../../redux/userSlice";
import { useNavigate } from "react-router-dom";

const Signin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // ✅ Login
  const handleLogin = async (e) => {
    e.preventDefault();
    dispatch(loginStart());
    try {
      const res = await api.post("/auth/signin", { username, password });
      dispatch(loginSuccess(res.data));
      navigate("/");
    } catch (err) {
      dispatch(loginFailed());
    }
  };

  // ✅ Signup
  const handleSignup = async (e) => {
    e.preventDefault();
    dispatch(loginStart());
    try {
      const res = await api.post(
        "/auth/signup",
        { username, email, password }
      );
      dispatch(loginSuccess(res.data));
      navigate("/");
    } catch (err) {
      dispatch(loginFailed());
    }
  };

  return (
    <div className="min-h-screen bg-orange-50 flex items-center justify-center mt-[60px]">
      <div className="card w-[90%] max-w-lg p-8 flex flex-col gap-6">
        <h2 className="text-3xl font-extrabold text-orange-500 text-center mb-2">
          Welcome to Chatty
        </h2>
        <p className="text-center text-gray-500 mb-4">
          Connect and share your thoughts with the world.
        </p>

        {/* ✅ LOGIN */}
        <form className="space-y-4" onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Username"
            className="w-full px-4 py-3 border border-orange-200 rounded-xl bg-orange-50 focus:ring-2 focus:ring-orange-400 focus:outline-none text-lg"
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full px-4 py-3 border border-orange-200 rounded-xl bg-orange-50 focus:ring-2 focus:ring-orange-400 focus:outline-none text-lg"
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="submit"
            className="w-full orange-gradient py-3 rounded-xl font-semibold text-lg shadow-md hover:scale-105 transition"
          >
            Sign In
          </button>
        </form>

        <div className="relative my-2">
          <span className="absolute inset-x-0 top-2/4 transform -translate-y-2/4 h-[1px] bg-gray-200"></span>
          <span className="bg-white px-4 text-gray-500 relative text-sm">or</span>
        </div>

        {/* ✅ SIGNUP */}
        <form className="space-y-4" onSubmit={handleSignup}>
          <input
            type="text"
            placeholder="Username"
            className="w-full px-4 py-3 border border-orange-200 rounded-xl bg-orange-50 focus:ring-2 focus:ring-orange-400 focus:outline-none text-lg"
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="email"
            placeholder="Email"
            className="w-full px-4 py-3 border border-orange-200 rounded-xl bg-orange-50 focus:ring-2 focus:ring-orange-400 focus:outline-none text-lg"
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full px-4 py-3 border border-orange-200 rounded-xl bg-orange-50 focus:ring-2 focus:ring-orange-400 focus:outline-none text-lg"
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="submit"
            className="w-full orange-gradient py-3 rounded-xl font-semibold text-lg shadow-md hover:scale-105 transition"
          >
            Sign Up
          </button>
        </form>
      </div>
    </div>
  );
};

export default Signin;
