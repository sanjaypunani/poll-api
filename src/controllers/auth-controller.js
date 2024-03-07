import { checkPasword, generateToken } from "../../utils/common";
import Models from "../models";

const baseController = {
  index: (req, res) => {
    return res.status(200).json({
      success: true,
      message: ":)",
    });
  },

  login: async (req, res) => {
    const { email, password } = req.body;
    const findQuery = { email: { $eq: email } };

    const user = await Models.User.findOne(findQuery);
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "Email is not found in Database",
      });
    }

    let token = await generateToken(user);
    if (!checkPasword(user, password)) {
      return res.status(412).send({
        success: false,
        message: "Password is wrong",
      });
    }

    return res.status(200).send({
      success: true,
      message: "Login Success",
      data: { token },
    });
  },

  signup: (req, res) => {
    const { email, name, password } = req.body;
    const file = req.file;

    const newUserObj = {
      email,
      name,
      password,
    };

    const newUser = new Models.User(newUserObj);

    newUser.save(async (saveErr, data) => {
      if (saveErr) {
        return res.status(412).send({
          success: false,
          message: saveErr,
        });
      }

      return res.status(200).json({
        success: true,
        message: "signup successful",
      });
    });
  },
};

export default baseController;
