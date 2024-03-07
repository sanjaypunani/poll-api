const SALT_WORK_FACTOR = 10;
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

//  User Schema
const UserSchema = mongoose.Schema(
  {
    password: {
      type: mongoose.Schema.Types.String,
    },
    email: {
      type: mongoose.Schema.Types.String,
      unique: true,
    },
    name: {
      type: mongoose.Schema.Types.String,
      required: true,
    },
  },
  { timestamps: true }
);
UserSchema.pre("save", function (next) {
  const user = this;
  if (user.password) {
    if (user.isModified("password") === false) {
      return next();
    }
    bcrypt.genSalt(SALT_WORK_FACTOR, (err, salt) => {
      if (err) {
        return next(err);
      }
      // the new salt hashes the new password
      bcrypt.hash(user.password, salt, (error, hash) => {
        if (error) {
          return next(error);
        }

        // the clear text password overidden
        user.password = hash;
        return next();
      });
    });
  } else {
    return next();
  }
});

UserSchema.statics = {
  valueExists(query) {
    return this.findOne(query).then((result) => result);
  },
};

export default mongoose.model("User", UserSchema);
