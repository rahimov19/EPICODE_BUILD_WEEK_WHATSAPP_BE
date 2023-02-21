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
import usersRouter from "./apis/users/index.js";
import chatsRouter from "./apis/chats/index.js";
import passport from "passport";
import googleStrategy from "./library/authentication/google.js";
import { Server } from "socket.io";
import { createServer } from "http";
import { newConnectionhandler } from "./socket/index.js";

const expressServer = express();

const port = process.env.PORT || 3001;

const httpServer = createServer(expressServer);
const io = new Server(httpServer);
io.on("connection", newConnectionhandler);

passport.use("google", googleStrategy);

//MIDDLEWARES

expressServer.use(cors());
expressServer.use(express.json());

//ENDPOINTS
expressServer.use("/users", usersRouter);
expressServer.use("/chats", chatsRouter);
expressServer.use(passport.initialize());

//ERROR HANDLERS
expressServer.use(badRequestHandler);
expressServer.use(unauthorizedHandler);
expressServer.use(forbiddenHandler);
expressServer.use(notFoundHandler);
expressServer.use(genericErrorHAndler);

mongoose.connect(process.env.MONGO_URL);

mongoose.connection.on("connected", () => {
  console.log("Connected to Mongo!");
  httpServer.listen(port, () => {
    console.table(listEndpoints(expressServer));
    console.log(`Server is running on port: ${port}`);
  });
});
