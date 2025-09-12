import express from "express";
import { login, logout, register } from "../controllers/auth.controllers.js";
import { validate, schemas } from "../middlewares/validate.middleware.js";
import rateLimit from "express-rate-limit";

const authRouter = express.Router();

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 50, standardHeaders: true, legacyHeaders: false });
authRouter.post("/login", authLimiter, validate(schemas.auth.login), login);
authRouter.post("/register", authLimiter, validate(schemas.auth.register), register);
authRouter.post("/logout", logout)

export default authRouter;