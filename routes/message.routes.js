import express from "express";
import { authorize } from "../middlewares/auth.middleware.js";
import { getAllMessages, sendMessage, markMessageRead, getUnreadCount } from "../controllers/message.controllers.js";
import { validate, schemas } from "../middlewares/validate.middleware.js";

const messageRouter = express.Router();

messageRouter.get("/", authorize, getAllMessages);
messageRouter.post("/", validate(schemas.message.send), sendMessage);
messageRouter.patch("/:messageId/read", authorize, markMessageRead);
messageRouter.get("/unread/count", authorize, getUnreadCount);

export default messageRouter