import jsonwebtoken from "jsonwebtoken";
import bcrypt from "bcryptjs";

export const generateToken = async (user) => {
  const secret = process.env.SECRET;

  const token = jsonwebtoken.sign(
    {
      id: user._id,
      email: user.email,
      phone: user.phone,
    },
    secret,
    {
      expiresIn: "30d",
    }
  );
  return token;
};

export const checkPasword = (user, password) => {
  return bcrypt.compareSync(password, user.password);
};
