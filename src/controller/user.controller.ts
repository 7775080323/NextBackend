import { io } from "../index"; 
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../model/user.model"; // Ensure you have a User model
import dotenv from "dotenv";

dotenv.config();

export const registerUser = async (req: any, res: any) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ success: true, message: "User registered successfully" });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const loginUser = async (req: any, res: any) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found!" });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate JWT Token
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined in environment variables");
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    // Mark user as active in the database
    await User.updateOne({ _id: user._id }, { $set: { isActive: true } });

    // Emit socket event to notify users
    io.emit("userOnline", { id: user._id, name: user.name, email: user.email });

    res.status(200).json({ 
      token, 
      user: { id: user._id, name: user.name, email: user.email } 
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
