import Validator from "../helpers/validate";

const signup = async (req, res, next) => {
  const validationRule = {
    email: "string|email|exist:User,email",
    password: "string|min:6|strict",
    name: "required|string",
  };

  await Validator(req.body, validationRule, {}, (err, status) => {
    if (!status) {
      res.status(412).send({
        success: false,
        message: "Validation failed",
        data: err,
      });
    } else {
      next();
    }
  });
};

const login = async (req, res, next) => {
  const validationRule = {
    email: "string|email|exist:User,email",
    phone: "string|exist:User,phone",
  };

  await Validator(req.body, validationRule, {}, (err, status) => {
    if (!status) {
      res.status(412).send({
        success: false,
        message: "Validation failed",
        data: err,
      });
    } else {
      next();
    }
  });
};

const validationMiddleware = {
  signup,
  login,
};

export default validationMiddleware;
