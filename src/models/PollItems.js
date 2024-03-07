import mongoose from "mongoose";

const PollItemSchema = mongoose.Schema(
  {
    name: {
      type: mongoose.Schema.Types.String,
    },
    poll: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Polls",
    },
  },
  { timestamps: true }
);

export default mongoose.model("PollItem", PollItemSchema);
