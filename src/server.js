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

const server = express();

const port = process.env.PORT || 3001;

//MIDDLEWARES

server.use(cors());
server.use(express.json());

//ENDPOINTS
server.use("/chats", chatsRouter);
server.use("/messages", messagesRouter);

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
