import mongoose from "mongoose";

const { Schema, model } = mongoose;

const messagesSchema = new Schema(
  {
    history: [{ type: Schema.Types.ObjectId, ref: "Messages" }],
    type: { type: String, required: true },
    members: [{ type: Schema.Types.ObjectId, ref: "Users" }],
    deleted: { type: Boolean, default: false },
  },
  {
    timestamps: true, // this option automatically adds the createdAt and updatedAt fields
  }
);

export default model("Message", messagesSchema);
