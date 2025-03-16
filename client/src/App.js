import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";

import "./App.css";
import Home from "./pages/Home/Home";
import Profile from "./pages/Profile/Profile";
import Explore from "./pages/Explore/Explore";
import Signin from "./pages/Signin/Signin";
import Navbar from "./components/Navbar/Navbar";
import Error from "./pages/Error/Error";

// wrapping the pages with a consistent layout
// navbar followed by the main content
const Layout = () => {
  return (
    <div className="md:w-8/12 mx-auto">
      <Navbar />
      <Outlet></Outlet>
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
