// this component defines the user authentication state and actions

import { createSlice } from "@reduxjs/toolkit";


// currentUser: stores user details
// isLoading: tracks when login requests are in progress
// error: tracks errors during login
const initialState = {
  currentUser: null,
  isLoading: false,
  error: false,
};

// createSlice: defines a slice of state with reducers
export const userSlice = createSlice({
  // the slice is named user (it will appear as state.user in Redux)
  name: "user",
  initialState,
  reducers: {

    // this is called before making a login request
    // it sets isLoading to true which indicates the login is in progress
    loginStart: (state) => {
      state.isLoading = true;
    },

    // called when login is successful
    // it stops the loading action and stores the user object (state.currentUser = action.payload)
    loginSuccess: (state, action) => {
      state.isLoading = false;
      state.currentUser = action.payload;
      state.error = false;
    },

    // called if login fails
    // stops the loading action and sets error to true
    loginFailed: (state) => {
      state.isLoading = false;
      state.error = true;
    },

    // logout resets the whole user state and the user gets logged out
    logout: (state) => {
      // Clear any persisted data from localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('persist:root');
      }
      return initialState;
    },

    // updates the user's profile pic
    changeProfile: (state, action) => {
      state.currentUser = action.payload;
    },

    // deals with follow/unfollow actions
    // for users already followed, the following arrat is removed
    // users not followed are added to the following array
    following: (state, action) => {
      if (state.currentUser.following.includes(action.payload)) {
        state.currentUser.following.splice(
          state.currentUser.following.findIndex(
            (followingId) => followingId === action.payload
          )
        );
      } else {
        state.currentUser.following.push(action.payload);
      }
    },

    // Add follow request to pending followers
    addFollowRequest: (state, action) => {
      if (!state.currentUser.pendingFollowers.includes(action.payload)) {
        state.currentUser.pendingFollowers.push(action.payload);
      }
    },

    // Remove follow request from pending followers (when accepted/rejected)
    removeFollowRequest: (state, action) => {
      state.currentUser.pendingFollowers = state.currentUser.pendingFollowers.filter(
        (id) => id !== action.payload
      );
    },

    // Update pending followers array
    updatePendingFollowers: (state, action) => {
      state.currentUser.pendingFollowers = action.payload;
    },
  },
});


// actions are exported
export const {
  loginStart,
  loginSuccess,
  loginFailed,
  logout,
  changeProfile,
  following,
  addFollowRequest,
  removeFollowRequest,
  updatePendingFollowers,
} = userSlice.actions;

export default userSlice.reducer;


/*

Overview: 
 -the userSlice component manages the authentication state
 -it provides actions for login, logout and profile updates
 -implements the follow/unfollow system
 -connects to store.js for persistence

*/