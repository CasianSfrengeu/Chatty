// This component fetches and displays a user's basic profile info

import axios from "axios";
import React, { useState, useEffect } from "react";

import { useLocation, useParams } from "react-router-dom";

const UserPlaceholder = ({ setUserData, userData }) => {

  // getting the user id
  const { id } = useParams();
  // getting the current page location
  const location = useLocation().pathname;

  // fetching the user profile info from the backend when the component mounts, or when the user ID changes
  useEffect(() => {
    const fetchData = async () => {
      try {
        // GET request to get the user's details based on their id
        const userProfile = await axios.get(`/users/find/${id}`);
        // updating the user's data state in the parent component
        setUserData(userProfile.data);
      } catch (e) {
        console.log(e);
      }
    };
    fetchData();
  }, [id]);

  // displaying the username
  return <div>{userData?.username}</div>;
};

export default UserPlaceholder;
