import mongoose from "mongoose";

const { Schema, model } = mongoose;

const messagesSchema = new Schema(
  {
    sender: { type: Schema.Types.ObjectId, ref: "User" },
    text: { type: String, required: true },
    deleted: { type: Boolean, default: false },
    image: { type: String },
  },
  {
    timestamps: true, // this option automatically adds the createdAt and updatedAt fields
  }
);

export default model("Messages", messagesSchema);
