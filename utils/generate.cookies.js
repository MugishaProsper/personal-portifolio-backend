import jwt from "jsonwebtoken";
import { configDotenv } from "dotenv";
configDotenv()

export const generateTokenAndSetCookie = async (userId, res) => {
    try {
        const payload = {
            id: userId
        };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '15d' });
        res.cookie('token', token, {
            maxAge: 15 * 24 * 60 * 60 * 1000,
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
        });
    } catch (error) {
        throw new Error(error)
    }
}