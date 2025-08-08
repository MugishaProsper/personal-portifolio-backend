import express from "express";
import { authorize } from "../middlewares/auth.middleware.js";
import { getLoggedInUser, getRecentActivity } from "../controllers/user.controllers.js";
import { getDashboardStats } from "../controllers/statistics.controllers.js";

const userRouter = express.Router();

userRouter.get("/me", authorize, getLoggedInUser);
userRouter.get("/me/recent-activity", authorize, getRecentActivity);
userRouter.get("/dashboard", authorize, getDashboardStats);

export default userRouter;