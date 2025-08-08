import express from "express";
import { createProject, deleteProject, getAllProjects, getProject, likeProject, unlikeProject, updateProject } from "../controllers/project.controllers.js";
import { authorize } from "../middlewares/auth.middleware.js";
import multer from "multer";

const storage = multer.memoryStorage();
const upload = multer({ storage });


const projectRouter = express.Router();

projectRouter.get("/", getAllProjects);
projectRouter.post("/", upload.single('sampleImage'), authorize, createProject);
projectRouter.put("/", authorize, updateProject);
projectRouter.delete("/", authorize, deleteProject);

projectRouter.get("/:projectId", getProject);
projectRouter.post("/likes", likeProject);
projectRouter.post("/likes", unlikeProject);

export default projectRouter