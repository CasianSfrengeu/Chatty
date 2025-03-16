// configure store: function to set up redux store
//combineReducers: allows multiple reducers to be combined into one
import { configureStore, combineReducers } from "@reduxjs/toolkit";

// userReducer: manages the state for user authentication
import userReducer from "./userSlice";

// persistStore: creates a persistor that manages storage and rehydration
// persistReducer: wraps reducers to enable persistence
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";

// storage: uses local storage as the default storage engine
import storage from "redux-persist/lib/storage";

// persistence setup
const persistConfig = {
  // the key under which Redux data is saved in the local storage
  key: "root",
  // versioning stored data (useful for migrations)
  version: 1,
  // defines the storage engine (using local storage)
  storage,
};

// Creating the Root Reducer
// combines different slices of state (we only have "user" for now)
const rootReducer = combineReducers({ user: userReducer });

// making the reducer persistent
// persistReducer wraps rootReducer, making it persistable
const persistedReducer = persistReducer(persistConfig, rootReducer);


// configuring the store
export const store = configureStore({
  reducer: persistedReducer,
  // middleware handling
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

// persistor is used in index.js to manage persisted state
export const persistor = persistStore(store);


/* 
Component overview:
 -sets up the redux toolkit and persist
 -stores user authentication state persistently
 -uses middleware to prevent issues with serialization
*/