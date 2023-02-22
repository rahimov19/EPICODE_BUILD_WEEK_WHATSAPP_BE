import { checkSchema, validationResult } from "express-validator";
import createHttpError from "http-errors";

const chatSchema = {
  type: {
    in: ["body"],
    isString: {
      errorMessage:
        "Type is a mandatory field and needs to be a String (private or group).",
    },
  },
  firstMessage: {
    in: ["body"],
    isString: {
      errorMessage:
        "firstMessage is a mandatory field and needs to be a String.",
    },
  },
};

export const checksChatSchema = checkSchema(chatSchema);

export const triggerBadRequest = (req, res, next) => {
  const errors = validationResult(req);
  console.log(errors.array());

  if (!errors.isEmpty()) {
    next(
      createHttpError(400, "Error during chat post validation", {
        errorsList: errors.array(),
      })
    );
  } else {
    next(); // no errors
  }
};

// VALIDATION CHAIN 1. checksChatSchema --> 2. triggerBadRequest
