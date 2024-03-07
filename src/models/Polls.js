import mongoose from "mongoose";

const PollsSchema = mongoose.Schema(
  {
    name: {
      type: mongoose.Schema.Types.String,
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Polls", PollsSchema);
