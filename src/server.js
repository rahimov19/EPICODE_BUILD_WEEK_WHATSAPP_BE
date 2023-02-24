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
import { instrument } from "@socket.io/admin-ui";

const expressServer = express();

const port = process.env.PORT || 3001;

const httpServer = createServer(expressServer);
const io = new Server(httpServer, {
  cors: {
    origin: "https://admin.socket.io",
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
    preflightContinue: false,
    optionsSuccessStatus: 200,
    credentials: true,
  },
});
io.on("connection", newConnectionhandler);
instrument(io, { namespaceName: "/admin", auth: false });

passport.use("google", googleStrategy);

//MIDDLEWARES
const whitelist = ["http://localhost:3000", "https://admin.socket.io/"];
const corsOpts = {
  origin: (origin, corsNext) => {
    console.log("CURRENT ORIGIN", origin);
    if (!origin || whitelist.indexOf(origin) !== -1) {
      corsNext(null, true);
    } else {
      corsNext(
        createHttpError(400, `Origin ${origin} is not in the whitelist`)
      );
    }
  },
};
expressServer.use(cors(corsOpts));

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
