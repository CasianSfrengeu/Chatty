import { createBrowserRouter, RouterProvider, Outlet, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

import "./App.css";
import Home from "./pages/Home/Home";
import Profile from "./pages/Profile/Profile";
import Explore from "./pages/Explore/Explore";
import Signin from "./pages/Signin/Signin";
import Navbar from "./components/Navbar/Navbar";
import Error from "./pages/Error/Error";
import Chat from "./pages/Chat/Chat";

// wrapping the pages with a consistent layout
// navbar followed by the main content
const Layout = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedHashtag, setSelectedHashtag] = useState("");
  const location = useLocation();

  // Clear search and hashtag when navigating away from home
  useEffect(() => {
    if (location.pathname !== "/") {
      setSearchQuery("");
      setSelectedHashtag("");
    }
  }, [location.pathname]);

  const handleSearch = (query) => {
    setSearchQuery(query);
    setSelectedHashtag(""); // Clear hashtag when searching
  };

  const handleHashtagClick = (hashtag) => {
    setSelectedHashtag(hashtag);
    setSearchQuery(""); // Clear search when clicking hashtag
  };

  return (
    <div className="md:w-8/12 mx-auto">
      <Navbar onSearch={handleSearch} />
      <Outlet context={{ 
        searchQuery, 
        setSearchQuery, 
        selectedHashtag, 
        setSelectedHashtag,
        handleHashtagClick 
      }} />
    </div>
  );
};

// app router configuration
const router = createBrowserRouter([
  {
    path: "/",
    errorElement: <Error />, // for invalid routes
    element: <Layout />, // main layout with navbar
    children: [
      {
        path: "/",
        element: <Home />, // home page
      },
      {
        path: "/profile/:id",
        element: <Profile />, // user profile
      },
      {
        path: "/explore",
        element: <Explore />, // explore page
      },
      {
        path: "/signin",
        element: <Signin />, // signin page
      },
      {
        path: "/signout",
        element: <Signin />, // signout redirects to signin page
      },
      {
        path: "/chat",
        element: <Chat />,
      },
    ],
  },
]);

function App() {
  return (
    <div>
      <RouterProvider router={router}></RouterProvider>
    </div>
  );
}

export default App;
