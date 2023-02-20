import { checkSchema, validationResult } from "express-validator";
import createHttpError from "http-errors";

const messageSchema = {
  text: {
    in: ["body"],
    isString: {
      errorMessage: "Text is a mandatory field and needs to be a String.",
    },
  },
};

export const checksMessageSchema = checkSchema(messageSchema);

export const triggerBadRequest = (req, res, next) => {
  const errors = validationResult(req);
  console.log(errors.array());

  if (!errors.isEmpty()) {
    next(
      createHttpError(400, "Error during message post validation", {
        errorsList: errors.array(),
      })
    );
  } else {
    next(); // no errors
  }
};

// VALIDATION CHAIN 1. checksMessageSchema --> 2. triggerBadRequest
