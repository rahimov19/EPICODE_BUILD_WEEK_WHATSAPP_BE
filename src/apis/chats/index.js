import express from "express";
import createHttpError from "http-errors";
import { checksChatSchema } from "./validator.js";
import ChatsModel from "./model.js";
import MessagesModel from "../messages/model.js";

const chatsRouter = express.Router();

// MESSAGES

chatsRouter.post("/:chatId/messages", async (req, res, next) => {
  try {
    const chat = await ChatsModel.findById(req.params.chatId);
    if (chat) {
      req.body.sender = "63f351c352128a6d77801509"; // !replace with req.user._id

      const message = {
        ...req.body,
      };

      const newMessage = new MessagesModel(message);

      const { _id } = await newMessage.save();

      chat.history.push(_id);

      await ChatsModel.findByIdAndUpdate(req.params.chatId, chat, {
        new: true,
      });

      res.send({ _id });
    } else {
      next(
        createHttpError(404, `Chat with id ${req.params.chatId} not found!`)
      );
    }
  } catch (error) {
    next(error);
  }
});

chatsRouter.get("/messages", async (req, res, next) => {
  try {
    const messages = await MessagesModel.find().populate("sender");
    res.send(messages);
  } catch (error) {
    next(error);
  }
});

chatsRouter.get("/messages/:messageId", async (req, res, next) => {
  try {
    const message = await MessagesModel.findById(req.params.messageId);
    res.send(message);
  } catch (error) {
    next(error);
  }
});

// CHATS

chatsRouter.post("/", checksChatSchema, async (req, res, next) => {
  try {
    req.body.members = [...req.body.members, "63f351c352128a6d77801509"]; // !replace with req.user._id
    req.body.history = [];
    req.body.deletedBy = [];

    const chat = {
      ...req.body,
    };

    const newChat = new ChatsModel(chat);

    const { id } = await newChat.save();

    res.send({ id });
  } catch (error) {
    next(error);
  }
});

chatsRouter.get("/", async (req, res, next) => {
  try {
    const chats = await ChatsModel.find()
      .populate("history")
      .populate("members");
    res.send(chats);
  } catch (error) {
    next(error);
  }
});

chatsRouter.get("/:chatId", async (req, res, next) => {
  try {
    const chat = await ChatsModel.findById(req.params.chatId)
      .populate("history")
      .populate("members");
    res.send(chat);
  } catch (error) {
    next(error);
  }
});

export default chatsRouter;
