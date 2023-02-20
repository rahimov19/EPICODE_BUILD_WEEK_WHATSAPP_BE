import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import listEndpoints from "express-list-endpoints";
import {
  badRequestHandler,
  forbiddenHandler,
  genericErrorHAndler,
  unauthorizedHandler,
  notFoundHandler,
} from "./errorHandlers.js";
import chatsRouter from "./apis/chats/index.js";
import messagesRouter from "./apis/messages/index.js";
import passport from "passport";
import googleStrategy from "./library/authentication/google.js";

const server = express();

const port = process.env.PORT || 3001;

passport.use("google", googleStrategy);

//MIDDLEWARES

server.use(cors());
server.use(express.json());

//ENDPOINTS
server.use("/chats", chatsRouter);
server.use("/messages", messagesRouter);
server.use(passport.initialize());

//ERROR HANDLERS
server.use(badRequestHandler);
server.use(unauthorizedHandler);
server.use(forbiddenHandler);
server.use(notFoundHandler);
server.use(genericErrorHAndler);

mongoose.connect(process.env.MONGO_URL);

mongoose.connection.on("connected", () => {
  console.log("Connected to Mongo!");
  server.listen(port, () => {
    console.table(listEndpoints(server));
    console.log(`Server is running on port: ${port}`);
  });
});
