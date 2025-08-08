import jwt from "jsonwebtoken";
import { configDotenv } from "dotenv";
configDotenv()

export const authorize = (req, res, next) => {
    const { token } = req.cookies;
    if (!token) return res.status(404).json({ message: "No token provided" })
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded) {
            return { message: "Invalid token" }
        };
        req.user = decoded;
        next();
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Internal server error" })
    }
}