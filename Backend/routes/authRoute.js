// Updated Express.js Auth Routes using HTTP-only Cookies

import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { body, validationResult } from "express-validator";
import User from "../models/User.js";
import RefreshToken from "../models/RefreshToken.js";
import 'dotenv/config';

const router = express.Router();

// Helper functions
const generateAccessToken = (user) => {
  return jwt.sign({ sub: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "15m",
  });
};

const generateRefreshToken = (user) => {
  return jwt.sign({ id: user._id }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "7d",
  });
};

// Register
router.post(
  "/register",
  [
    body("username").notEmpty().isAlphanumeric(),
    body("password").isLength({ min: 6 }),
    body("fullName").notEmpty(),
    body("role").isIn(["USER", "ADMIN", "STAFF"]),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    try {
      const { username, password, fullName, role } = req.body;
      const existingUser = await User.findOne({ username });
      if (existingUser)
        return res.status(400).json({ message: "Username is already taken" });

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new User({
        username,
        password: hashedPassword,
        fullName,
        role,
      });
      await user.save();

      res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
      console.error("Register error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// Login
router.post(
  "/login",
  [body("username").notEmpty(), body("password").notEmpty()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    try {
      const { username, password } = req.body;
      const deviceInfo = req.headers["device-info"] || "unknown device";
      // console.log(req.headers, req.body);

      // FIX: explicitly select password
      const user = await User.findOne({ username: username.toString() }).select("+password");

      if (!user)
        return res.status(205).json({ message: "User not found" });

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword)
        return res.status(205).json({ message: "Invalid credentials" });

      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);

      await new RefreshToken({
        user: user._id,
        token: refreshToken,
        deviceInfo,
        expiresAt: new Date(Date.now() + 7 * 86400000),
      }).save();

      res.cookie("access_token", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "None",
        secure: true,  
        maxAge: 15 * 60 * 1000,
      });
      res.cookie("refresh_token", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "None",
        secure: true,  
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.json({
        user: { id: user._id, username: user.username, role: user.role },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);


// Refresh
router.post("/refresh", async (req, res) => {
  const token = req.cookies.refresh_token;
  
  if (!token) return res.status(401).json({ message: "Missing refresh token" });

  try {
    const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    const stored = await RefreshToken.findOne({ token, user: decoded.id });

    if (!stored || stored.expiresAt < new Date()) {
      if (stored) await RefreshToken.deleteOne({ token });
      return res
        .status(403)
        .json({ message: "Refresh token expired or invalid" });
    }

    const user = await User.findById(decoded.id);
    if (!user) return res.status(403).json({ message: "User not found" });

    const newAccessToken = generateAccessToken(user);
    res.cookie("access_token", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "None",
      secure: true,  
      maxAge: 15 * 60 * 1000,
    });

    res.json({ message: "Access token refreshed" });
  } catch (error) {
    console.error("Refresh error:", error);
    res.status(403).json({ message: "Invalid refresh token" });
  }
});

// Logout
router.post("/logout", async (req, res) => {
  try {
    const token = req.cookies.refresh_token;
    if (token) {
      await RefreshToken.deleteOne({ token });
    }

    res.clearCookie("access_token");
    res.clearCookie("refresh_token");
    res.json({ message: "Logout successful" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/me", async (req, res) => {
  try {
    const token = req.cookies.access_token;

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.sub).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ user });
  } catch (error) {
    console.error("/auth/me error:", error);
    res.status(401).json({ message: "Invalid or expired token" });
  }
});

router.get("/username/:username", async (req, res) => {
  const { username } = req.params;
  try {
    const response = await User.findOne(
      { username },
      { username: 1, _id: 0 }
    );

    if (!response) {
      return res.status(205).json({ message: "User not found", data: true });
    }

    return res.status(200).json({ response, data: false });
  } catch (error) {
    console.error("Error fetching username:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});


export default router;
