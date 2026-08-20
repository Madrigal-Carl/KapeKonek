import {
  registerUser,
  verifyUserEmail,
  loginUser,
  logoutUser,
} from "../services/auth.service.js";
import { sendTokenCookies } from "../utils/sendTokenCookies.js";
import { clearTokenCookies } from "../utils/clearTokenCookies.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const register = asyncHandler(async (req, res) => {
  await registerUser(req.body);

  return res.status(201).json({
    message: "Account created. Please verify your email.",
  });
});

export const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.params;

  const { accessToken, refreshToken } = await verifyUserEmail(token);

  sendTokenCookies({
    res,
    accessToken,
    refreshToken,
  });

  return res.json({
    message: "Email verified successfully",
  });
});

export const login = asyncHandler(async (req, res) => {
  const { accessToken, refreshToken, user } = await loginUser(req.body);

  sendTokenCookies({
    res,
    accessToken,
    refreshToken,
  });

  return res.json({
    message: "Login successful",
    user: {
      id: user._id,
      email: user.email,
      role: user.role,
    },
  });
});

export const logout = asyncHandler(async (req, res) => {
  await logoutUser();

  clearTokenCookies(res);

  return res.json({
    message: "Logged out successfully",
  });
});

import FarmerVerification from "../models/farmerVerification.model.js";

export const getMe = asyncHandler(async (req, res) => {
  if (!req.user) {
    return res.json({ user: null });
  }

  const userData = req.user.toObject ? req.user.toObject() : { ...req.user };

  if (userData.role === "farmer") {
    const verification = await FarmerVerification.findOne({ user: userData._id });
    userData.accountStatus = verification?.accountStatus ?? "pending";
    userData.associationStatus = verification?.associationStatus ?? "pending";
  }

  return res.json({
    user: userData,
  });
});
