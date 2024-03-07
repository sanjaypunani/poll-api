import Models from "../models";

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

    //myLike
    query.push({
      $addFields: {
        myVote: {
          $cond: {
            if: {
              $gt: [
                {
                  $size: {
                    $filter: {
                      input: "$myAction",
                      as: "like",
                      cond: {
                        $and: [
                          {
                            $eq: [
                              "$$like.action_user",
                              mongoose.Types.ObjectId(req.user.id),
                            ],
                          },
                          { $eq: ["$$like.action_type", "like"] },
                        ],
                      },
                    },
                  },
                },
                0,
              ],
            },
            then: true,
            else: false,
          },
        },
      },
    });

    Models.Polls.aggregate(query, (err, data) => {
      if (err) {
        res.send({ success: false, data, error: err });
        return;
      }
      res.send({ success: true, data, message: "User pools success" });
    });
  },

  votePollItem: async (req, res) => {
    const { poll, pollItem } = req.body;
    const voteData = {
      voter: req.user.id,
      poll,
      pollItem,
    };
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
