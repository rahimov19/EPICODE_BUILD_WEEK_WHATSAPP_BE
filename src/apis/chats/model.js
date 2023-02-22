import mongoose from "mongoose";

const { Schema, model } = mongoose;

const chatsSchema = new Schema(
  {
    history: [{ type: Schema.Types.ObjectId, ref: "Messages" }],
    type: { type: String, enum: ["private", "group"], required: true },
    members: [{ type: Schema.Types.ObjectId, ref: "User" }],
    deletedBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
    firstMessage: { type: String, required: true },
    groupName: { type: String },
  },
  {
    timestamps: true, // this option automatically adds the createdAt and updatedAt fields
  }
);

export default model("Chat", chatsSchema);
