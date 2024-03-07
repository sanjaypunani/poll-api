import mongoose from "mongoose";

const VotesSchema = mongoose.Schema(
  {
    voter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
    },
    poll: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Polls",
    },
    pollItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PollItems",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Votes", VotesSchema);
