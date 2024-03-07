import Models from "../models";
import mongoose from "mongoose";

const baseController = {
  createPoll: async (req, res) => {
    const pollData = {
      name: req.body.name,
      creator: req.user.id,
    };
    const newPoll = new Models.Polls(req.body);
    newPoll.save(async (saveErr, result) => {
      if (saveErr) {
        return res.status(412).send({
          success: false,
          message: saveErr,
        });
      }
      const pollItems = req.body.pollItems.map((item) => {
        return { ...item, poll: result._id };
      });
      if (pollItems.length) {
        await Models.PollItems.insertMany(pollItems);
      }

      return res.status(200).json({
        success: true,
        message: "poll create successful",
      });
    });
  },

  getAllPoll: async (req, res) => {
    let query = [];
    query.push({
      $lookup: {
        from: "pollitems",
        localField: "_id",
        foreignField: "poll",
        as: "pollItems",
      },
    });

    query.push({
      $lookup: {
        from: "votes",
        let: { poll: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$poll", "$$poll"] }, // Match votes with the same pollId
                  { $eq: ["$voter", mongoose.Types.ObjectId(req.user.id)] }, // Replace "your_user_id" with the user ID you're interested in
                ],
              },
            },
          },
        ],
        as: "myVotes",
      },
    });

    Models.Polls.aggregate(query, async (err, data) => {
      if (err) {
        res.send({ success: false, data, error: err });
        return;
      }

      let finalData = [];
      for (let i = 0; i < data?.length; i++) {
        let pollItems = data[i]?.pollItems;

        for (let j = 0; j < pollItems.length; j++) {
          let query = {
            pollItem: { $eq: pollItems[j]?._id },
          };
          let pollVoters = await Models.Votes.find(query);
          pollItems[j].voters = pollVoters;
        }
        finalData.push({ ...data[i], pollItems });
      }
      res.send({ success: true, finalData, message: "User pools success" });
    });
  },

  votePollItem: async (req, res) => {
    const { poll, pollItem } = req.body;
    const voteData = {
      voter: req.user.id,
      poll,
      pollItem,
    };
    let query = {
      voter: { $eq: req.user.id },
      poll: { $eq: poll },
    };
    const alreadyVote = await Models.Votes.findOne(query);
    if (alreadyVote) {
      return res.status(412).send({
        success: false,
        message: "You already vote this poll",
      });
    }
    const newVote = new Models.Votes(voteData);
    newVote.save(async (saveErr, result) => {
      if (saveErr) {
        return res.status(412).send({
          success: false,
          message: saveErr,
        });
      }

      return res.status(200).json({
        success: true,
        message: "vote create successful",
      });
    });
  },
};

export default baseController;
