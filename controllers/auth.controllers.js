import User from "../models/user.model.js";
import { hashPassword } from "../utils/hash.utils.js";
import { generateTokenAndSetCookie } from "../utils/generate.cookies.js";
import bcrypt from "bcryptjs";
import rateLimit from "express-rate-limit";

export const register = async (req, res) => {
    const { fullname, username, email, password } = req.body;
    try {
        const existing_user = await User.findOne({ email: email });
        if (existing_user) {
            return res.status(403).json({ message: "User already exists" })
        }
        // basic password policy: min 8, at least one letter and number
        const strong = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*()_+\-=]{8,}$/;
        if (!strong.test(password)) {
            return res.status(400).json({ message: "Password must be at least 8 chars and include letters and numbers" });
        }
        const hashedPassword = await hashPassword(password)
        const user = new User({ fullname, email, username, password: hashedPassword })
        user.statistics.activity.push(
            {
                type: "CREATE",
                message: "Account creation successful",
                timestamps: Date.now()
            }, {
            type: "LOGIN",
            description: "Login successful",
            timestamps: Date.now()
        });
        await user.save();
        await generateTokenAndSetCookie(user._id, res)
        return res.status(201).json({ message: "Account created successfully", user: user.getProfile() })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Internal server error" })
    }
};

export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email: email });
        if (!user) return res.status(404).json({ message: "User not found" });
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) return res.status(403).json({ message: "Invalid password" });
        user.statistics.activity.push({
            type: "LOGIN",
            description: "Login successful",
            timestamps: Date.now()
        })
        await user.save();
        await generateTokenAndSetCookie(user._id, res)
        return res.status(200).json({ message: "Login successful", user: user.getProfile() })
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server error" })
    }
};

export const logout = async (req, res) => {
    try {
        res.cookie('token', '', {
            maxAge: 0,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
        }).status(200).json({ message: "Logged out" })
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" })
    }
}