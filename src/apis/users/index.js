import express from "express";
import createHttpError from "http-errors";
import UsersModel from "./model.js";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { v2 as cloudinary } from "cloudinary";
import q2m from "query-to-mongo";
import passport from "passport";

const cloudinaryUploader = multer({
  storage: new CloudinaryStorage({
    cloudinary,
    params: {
      format: "jpeg",
      folder: "build-week-5-whatsApp-project",
    },
  }),
}).single("avatar");

const usersRouter = express.Router();

usersRouter.get("/", async (req, res, next) => {
  try {
    //search users by email or username (you find them in mongoquery.criteria)
    const mongoQuery = q2m(req.query);

    console.log(mongoQuery);

    const users = await UsersModel.find(
      mongoQuery.criteria,
      mongoQuery.options.fields
    );

    res.send({ users });
  } catch {
    next(error);
  }
});

usersRouter.post("/register", async (req, res, next) => {
  try {
    const newUser = new UsersModel(req.body);
    const { _id } = await newUser.save();
    res.status(201).send({ _id });
  } catch (error) {
    next(error);
  }
});

// usersRouter.get("/me", JWTAuthMiddleware, async (req, res, next) => {
//   try {
//     const user = await UsersModel.findById(req.user._id);
//     res.send(user);
//   } catch (error) {
//     next(error);
//   }
// });

// usersRouter.put("/me", JWTAuthMiddleware, async (req, res, next) => {
//   try {
//     const user = await UsersModel.findById(req.user._id);
//     if (user) {
//       //the req.user is updated by the JWTAuthMiddleware
//       //we use the verifyAccessToken function which resolves the promise
//       //(and returns the payload: with _id and the role)
//       //and if it rejects the promise, it return an error

//       const updatedUser = await UsersModel.findByIdAndUpdate(
//         req.user._id,
//         req.body,
//         { new: true, runValidators: true }
//       );
//       res.status(204).send(updatedUser);
//     } else {
//       next(createHttpError(404, `User with the provided id not found`));
//     }
//   } catch (error) {
//     next(error);
//   }
// });

// usersRouter.post(
//   "/me/avatar",
//   JWTAuthMiddleware,
//   cloudinaryUploader,
//   async (req, res, next) => {
//     try {
//       //we get from req.body the picture we want to upload
//       console.log(req.file.mimetype);
//       const updatedUser = await UsersModel.findByIdAndUpdate(
//         req.user._id,
//         { image: req.file.path },
//         { new: true, runValidators: true }
//       );
//       if (updatedUser) {
//         res.status(204).send(updatedUser);
//       } else {
//         next(createHttpError(404, `User with id ${req.user._id} not found`));
//       }
//     } catch (error) {
//       next(error);
//     }
//   }
// );

usersRouter.get("/:userId", async (req, res, next) => {
  try {
    const user = await UsersModel.findById(req.params.userId);
    if (user) {
      res.send(user);
    } else {
      next(createHttpError(404, `User with provided id not found`));
    }
  } catch {
    next(error);
  }
});

usersRouter.get(
  "/googleLogin",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

usersRouter.get(
  "/googleRedirect",
  passport.authenticate("google", { session: false }),
  async (req, res, next) => {
    res.redirect(`${process.env.FE_URL}/?accessToken=${req.user.accessToken}`);
  }
);

usersRouter.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await UsersModel.checkCredentials(email, password);
    if (user) {
      const payload = { _id: user._id };
      const accessToken = await createAccessToken(payload);
      res.send({ accessToken });
    } else {
      next(createHttpError(401, "Credentials are not OK!"));
    }
  } catch (error) {
    next(error);
  }
});

// usersRouter.delete("/session", JWTAuthMiddleware, async (req, res, next) => {
//   try {
//     const user = await UsersModel.findById(req.user._id);
//     if (user) {
//       res.status(204).send();
//     } else {
//       next(createHttpError(404, `User not found`));
//     }
//   } catch (error) {
//     next(error);
//   }
// });

export default usersRouter;
