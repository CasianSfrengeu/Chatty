// using the express node.js framework 
import express from "express";

import dotenv from "dotenv";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";

import userRoutes from "./routes/users.js";
import authRoutes from "./routes/auths.js";
import tweetRoutes from "./routes/tweets.js";

// initializing the express app
const app = express();
// lading the .env file variables (MONGO URI) into process.env
dotenv.config();

// DB connection function
const connect = () => {
  mongoose.set("strictQuery", false); // preventing deprevated query warning
  mongoose 
  // using mongoose.connect to connect to the MongoDB
    .connect(process.env.MONGO)
    .then(() => {
      // console message if the connection is successful
      console.log("connect to mongodb database");
    })
    // if the connection fails we throw an error
    .catch((err) => {
      throw err;
    });
};

// setup for the middleware
// cookie parser for authentication
app.use(cookieParser());
// express.json parses incoming json data
app.use(express.json());

// setting up the API routes
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/tweets", tweetRoutes);

// starting the server on port 8000
app.listen(8000, () => {
  // calling the connect function
  connect();
  console.log("Listening to port 8000");
});
