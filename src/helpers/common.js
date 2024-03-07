import Models from "../models";

export const createOrUpdateUserWallet = ({
  user,
  coins,
  swipes,
  active_plan,
}) => {
  return new Promise(async (resolve, reject) => {
    const query = { user: { $eq: user } };
    const userWalletInfo = await Models.UserWallet.findOne(query);

    if (Boolean(userWalletInfo)) {
      let data = {};
      if (coins || coins === 0) {
        data.coins = coins;
      }
      if (swipes || swipes === 0) {
        data.swipes = swipes;
      }
      if (active_plan) {
        data.active_plan = active_plan;
      }
      const update_query = { $_id: { $eq: userWalletInfo._id } };

      Models.UserWallet.findOneAndUpdate(
        update_query,
        data,
        function (err, list) {
          if (!err) {
            resolve(true);
          } else {
            reject(err);
          }
        }
      );
    } else {
      const data = {
        coins,
        swipes,
        user,
        active_plan,
      };
      const newUserWallet = new Models.UserWallet(data);
      newUserWallet.save((saveErr) => {
        if (saveErr) {
          reject(saveErr);
        }
        resolve(true);
      });
    }
  });
};

export const updateSwipeCountOfUser = (user) => {
  return new Promise(async (resolve, reject) => {
    const query = { user: { $eq: user } };
    const userWalletInfo = await Models.UserWallet.findOne(query);
    if (userWalletInfo) {
      if (userWalletInfo.swipes > 0) {
        let data = {
          swipes: userWalletInfo.swipes - 1,
        };
        console.log("userWalletInfo.swipes: ", userWalletInfo.swipes);

        await createOrUpdateUserWallet({ user, swipes: data?.swipes });
        resolve(true);
      } else {
        reject("reach daily swipe limit");
      }
    } else {
      reject("no user wallet founded");
    }
  });
};
