import express from "express";
import { checksChatSchema } from "./validator.js";
import ChatsModel from "./model.js";

const chatsRouter = express.Router();

chatsRouter.post("/", checksChatSchema, async (req, res, next) => {
  try {
    req.body.members = [req.user._id];
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
    const chats = await ChatsModel.find();
    res.send(chats);
  } catch (error) {
    next(error);
  }
});

chatsRouter.get("/:chatId", async (req, res, next) => {
  try {
    const chat = await ChatsModel.findbyId(req.params.chatId);
    res.send(chat);
  } catch (error) {
    next(error);
  }
});

export default chatsRouter;
