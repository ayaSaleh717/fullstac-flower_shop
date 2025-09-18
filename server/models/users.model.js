import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false, // Don't return password by default
    },
    // Legacy field for backward compatibility
    passwrd: {
      type: String,
      select: false,
    },
    userType: {
      type: String,
      required: true,
    },
    balance: {
      type: Number,
      default: 100,
    },
    activity: {
      type: Number,
      default: 0,
    },
    cashout: {
      type: Number,
      default: 0,
    },
    userImg: {
      type: String,
      default: 'https://th.bing.com/th/id/OIP.Od4m4w455EEToOQDKESqvgHaFJ?w=250&h=180&c=7&r=0&o=7&dpr=1.5&pid=1.7&rm=3',
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
