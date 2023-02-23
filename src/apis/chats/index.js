import express from "express";
import createHttpError from "http-errors";
import { checksChatSchema } from "./validator.js";
import ChatsModel from "./model.js";
import MessagesModel from "../messages/model.js";
import { JWTAuthMiddleware } from "../../library/authentication/jwtAuth.js";

const chatsRouter = express.Router();

// MESSAGES

chatsRouter.post(
  "/:chatId/messages",
  JWTAuthMiddleware,
  async (req, res, next) => {
    try {
      const chat = await ChatsModel.findById(req.params.chatId);
      if (chat) {
        const index = chat.members.findIndex(
          (m) => m._id.toString() === req.user._id
        );
        console.log(
          "🚀 ~ file: index.js:131 ~ chatsRouter.get ~ index:",
          index
        );

        if (index !== -1) {
          req.body.sender = req.user._id;

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
            createHttpError(
              401,
              `Authorization failed for chat with ID ${req.params.chatId}!`
            )
          );
        }
      } else {
        next(
          createHttpError(404, `Chat with id ${req.params.chatId} not found!`)
        );
      }
    } catch (error) {
      next(error);
    }
  }
);

chatsRouter.get("/messages", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const messages = await MessagesModel.find().populate("sender");
    res.send(messages);
  } catch (error) {
    next(error);
  }
}); //! need to delete this endpoint?

chatsRouter.put(
  "/messages/:messageId",
  JWTAuthMiddleware,
  async (req, res, next) => {
    try {
      const message = await MessagesModel.findById(req.params.messageId);
      if (message) {
        const auth = message.sender.toString() === req.user._id;

        if (auth) {
          const updatedMessage = await MessagesModel.findByIdAndUpdate(
            req.params.messageId,
            { text: req.body.text },
            { new: true }
          );
          res.send(updatedMessage);
        } else {
          next(
            createHttpError(
              401,
              `You cannot edit Message with id ${req.params.messageId}, since you are not the sender!`
            )
          );
        }
      } else {
        next(
          createHttpError(
            404,
            `Message with id ${req.params.messageId} not found!`
          )
        );
      }
    } catch (error) {
      next(error);
    }
  }
);

chatsRouter.delete(
  "/messages/:messageId",
  JWTAuthMiddleware,
  async (req, res, next) => {
    try {
      const message = await MessagesModel.findById(req.params.messageId);
      if (message) {
        const auth = message.sender.toString() === req.user._id;
        console.log("🚀 ~ file: index.js:77 ~ auth:", auth);

        if (auth) {
          const updatedMessage = await MessagesModel.findByIdAndUpdate(
            req.params.messageId,
            { deleted: true },
            { new: true }
          );
          res.send(updatedMessage);
        } else {
          next(
            createHttpError(
              401,
              `You cannot delete Message with id ${req.params.messageId}, since you are not the sender!`
            )
          );
        }
      } else {
        next(
          createHttpError(
            404,
            `Message with id ${req.params.messageId} not found!`
          )
        );
      }
    } catch (error) {
      next(error);
    }
  }
);

// CHATS

chatsRouter.post(
  "/",
  checksChatSchema,
  JWTAuthMiddleware,
  async (req, res, next) => {
    try {
      if (req.body.type === "private") {
        // checking if such a private chat already exists
        const recipient = req.body.members[0];
        req.body.members = [...req.body.members, req.user._id];

        const [checkDublicate] = await ChatsModel.find({
          members: req.body.members,
        });

        if (checkDublicate) {
          next(
            createHttpError(
              403,
              `This chat already exists with ID ${checkDublicate._id.toString()}!`
            )
          );
        } else {
          // reversing members array and check again if exists
          req.body.members = [req.user._id, recipient];
          const [checkDublicateReverse] = await ChatsModel.find({
            members: req.body.members,
          });
          if (checkDublicateReverse) {
            next(
              createHttpError(
                403,
                `This chat already exists with ID ${checkDublicateReverse._id.toString()}!`
              )
            );
          } else {
            // no duplicates --> creating a new chat in database
            const message = {
              sender: req.user._id,
              text: req.body.firstMessage,
              deleted: false,
            };

            const newMessage = new MessagesModel(message);

            const { _id } = await newMessage.save();

            req.body.members = [...req.body.members];
            req.body.history = [_id];
            req.body.deletedBy = [];

            const chat = {
              type: "private",
              members: req.body.members,
              history: req.body.history,
              deletedBy: req.body.deletedBy,
              firstMessage: req.body.firstMessage,
              room: req.body.room,
            };

            const newChat = new ChatsModel(chat);

            const { id } = await newChat.save();

            res.send({ id });
          }
        }
      } else {
        // Creating Group Chat without checking if same exists
        const message = {
          sender: req.user._id,
          text: req.body.firstMessage,
          deleted: false,
        };

        const newMessage = new MessagesModel(message);

        const { _id } = await newMessage.save();

        req.body.members = [...req.body.members, req.user._id];
        req.body.history = [_id];
        req.body.deletedBy = [];

        const chat = {
          ...req.body,
        };

        const newChat = new ChatsModel(chat);

        const { id } = await newChat.save();

        res.send({ id });
      }
    } catch (error) {
      next(error);
    }
  }
);

chatsRouter.get("/", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const chats = await ChatsModel.find({ members: { $in: req.user._id } })
      .populate({ path: "history", populate: { path: "sender" } })
      .populate("members")
      .transform((doc) => {
        const docs = doc.map((chat) => {
          const sortedMembers = chat.members.sort(
            (a, b) => (a._id == req.user._id) - (b._id == req.user._id)
          );
          chat.members = sortedMembers;
          return chat;
        });
        return docs;
        //I will always be the last user in this scenario
      });
    res.send(chats);
  } catch (error) {
    next(error);
  }
});

chatsRouter.get("/:chatId", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const chat = await ChatsModel.findById(req.params.chatId)
      .populate({ path: "history", populate: { path: "sender" } })
      .populate("members");
    console.log("🚀 ~ file: index.js:129 ~ chatsRouter.get ~ chat:", chat);

    const index = chat.members.findIndex(
      (m) => m._id.toString() === req.user._id
    );
    console.log("🚀 ~ file: index.js:131 ~ chatsRouter.get ~ index:", index);

    if (index !== -1) {
      res.send(chat);
    } else {
      next(
        createHttpError(
          401,
          `Authorization failed for chat with ID ${req.params.chatId}!`
        )
      );
    }
  } catch (error) {
    next(error);
  }
});

chatsRouter.delete("/:chatId", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const chat = await ChatsModel.findById(req.params.chatId);
    const index = chat.members.findIndex(
      (m) => m._id.toString() === req.user._id
    );
    console.log("🚀 ~ file: index.js:131 ~ chatsRouter.get ~ index:", index);

    if (index !== -1) {
      const updatedChat = await ChatsModel.findByIdAndUpdate(
        req.params.chatId,
        { $push: { deletedBy: req.user._id } },
        { new: true }
      )
        .populate("history")
        .populate("members")
        .populate("deletedBy");

      res.send(updatedChat);
    } else {
      next(
        createHttpError(
          401,
          `Authorization failed for chat with ID ${req.params.chatId}!`
        )
      );
    }
  } catch (error) {
    next(error);
  }
});

export default chatsRouter;
