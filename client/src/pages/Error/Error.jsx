import React from "react";
import { Link } from "react-router-dom";

// This component displays a 404 error page when the user navigates to a non-existent route

const Error = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-orange-50 text-gray-800">
      {/* Error Message */}
      <h2 className="text-5xl font-extrabold text-orange-500">404</h2>
      <p className="text-2xl font-bold">Oops! Page not found</p>
      <p className="text-gray-600">The page you're looking for doesn't exist.</p>

      {/* Back to Login Button */}
      <Link
        to="/signin"
        className="mt-6 bg-orange-500 hover:bg-orange-600 text-white py-2 px-6 rounded-full transition shadow-md"
      >
        Go to Login
      </Link>
    </div>
  );
};

export default Error;
