import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import emailQueue from "../queues/email.queue.js"
import { EMAIL_JOBS } from "../queues/email.jobs.js"

import {
  generateAccessToken,
  generateRefreshToken,
  generateVerifyToken,
} from "../utils/generateToken.js";

export const registerUser = async ({ email, password, fullname, role }) => {
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new Error("Email already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await User.create({
    email,
    password: hashedPassword,
    fullname,
    role,
    isVerified: false,
  });

  const verifyToken = generateVerifyToken(user._id);
  const verifyUrl = `${process.env.CLIENT_URL}/verify-email/${verifyToken}`;

  await emailQueue.add("email:verify", {
    type: EMAIL_JOBS.VERIFY_EMAIL,
    data: {
      to: user.email,
      verifyUrl,
    },
  });

  return user;
};

export const verifyUserEmail = async (token) => {
  const decoded = jwt.verify(token, process.env.JWT_VERIFY_SECRET);

  const user = await User.findById(decoded.userId);

  if (!user) {
    throw new Error("User not found");
  }

  if (user.isVerified) {
    return user;
  }

  user.isVerified = true;
  await user.save();

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  return { user, accessToken, refreshToken };
};

export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    throw new Error("Email is not registered");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new Error("Password is incorrect");
  }

  if (!user.isVerified && user.role === "buyer") {
    throw new Error("Please verify your email first");
  }

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  return {
    user,
    accessToken,
    refreshToken,
  };
};

export const logoutUser = async () => {
  return true;
};
