import express from "express";
import MessagesModel from "./model.js";

const messagesRouter = express.Router();

messagesRouter.post("/", async (req, res, next) => {
  try {
    // const messages = await MessagesModel.find();
    // res.send(messages);
  } catch (error) {
    next(error);
  }
});

messagesRouter.get("/", async (req, res, next) => {
  try {
    const messages = await MessagesModel.find();
    res.send(messages);
  } catch (error) {
    next(error);
  }
});

messagesRouter.get("/:messageId", async (req, res, next) => {
  try {
    const message = await MessagesModel.findbyId(req.params.messageId);
    res.send(message);
  } catch (error) {
    next(error);
  }
});

export default messagesRouter;
