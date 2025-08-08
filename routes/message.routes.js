import express from "express";
import { authorize } from "../middlewares/auth.middleware.js";
import { getAllMessages, sendMessage } from "../controllers/message.controllers.js";

const messageRouter = express.Router();

messageRouter.get("/", authorize, getAllMessages);
messageRouter.post("/", sendMessage);

export default messageRouter