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

export const getRandomId = () => {
  return Math.floor(Math.random() * 100000000000 + 1);
};

export const calculateAge = (birthdate) => {
  var dob = new Date(birthdate);
  //calculate month difference from current date in time
  var month_diff = Date.now() - dob.getTime();
  console.log("month_diff: ", month_diff);

  //convert the calculated difference in date format
  var age_dt = new Date(month_diff);

  //extract year from date
  var year = age_dt.getUTCFullYear();
  console.log("year: ", year);

  //now calculate the age of the user
  var age = Math.abs(year - 1970);
  return age;
};
