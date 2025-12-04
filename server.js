const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");

// load env variables
require("dotenv").config();

// Import User Model
const User = require("./models/user");

const app = express();
app.use(express.json());
app.use(cors());

// --------------------------
// MongoDB Connection (Atlas)
// --------------------------
mongoose
  .connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 30000,
  })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log("DB Error:", err));

// --------------------------
// Test Route
// --------------------------
app.get("/", (req, res) => {
  res.send("Backend working!");
});

// --------------------------
// Register API
// --------------------------
app.post("/register", async (req, res) => {
  try {
    const { name, email, password, role, semester } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.json({ success: false, message: "Email already registered" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role,
      semester,
    });

    await newUser.save();

    // Return user without password
    res.json({
      success: true,
      message: "User registered successfully",
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        semester: newUser.semester,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Registration failed" });
  }
});

// --------------------------
// Login API
// --------------------------
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({ success: false, message: "Incorrect password" });
    }

    // Return user without password
    res.json({
      success: true,
      message: "Login successful",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        semester: user.semester,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Login failed" });
  }
});

// --------------------------
// Start Server
// --------------------------
app.listen(5000, () => console.log("Server running on port 5000"));
