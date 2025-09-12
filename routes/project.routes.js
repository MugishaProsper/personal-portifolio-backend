import express from "express";
import { createProject, deleteProject, getAllProjects, getProject, likeProject, unlikeProject, updateProject, addProjectComment, deleteProjectComment } from "../controllers/project.controllers.js";
import { authorize } from "../middlewares/auth.middleware.js";
import multer from "multer";
import { validate, schemas } from "../middlewares/validate.middleware.js";

const storage = multer.memoryStorage();
const allowedMimes = [
  'image/jpeg', 'image/png', 'image/webp', 'image/gif'
];
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024, files: 5 },
  fileFilter: (req, file, cb) => {
    if (allowedMimes.includes(file.mimetype)) return cb(null, true);
    return cb(new Error('Invalid file type'));
  }
});


const projectRouter = express.Router();

projectRouter.get("/", getAllProjects);
projectRouter.post("/", upload.fields([{ name: 'sampleImage', maxCount: 1 }, { name: 'sampleImages', maxCount: 5 }]), authorize, validate(schemas.project.create), createProject);
projectRouter.put("/:projectId", upload.fields([{ name: 'sampleImage', maxCount: 1 }, { name: 'sampleImages', maxCount: 5 }]), authorize, validate(schemas.project.update), updateProject);
projectRouter.delete("/:projectId", authorize, deleteProject);

projectRouter.get("/:projectId", getProject);
projectRouter.post("/:projectId/likes", validate(schemas.project.like), likeProject);
projectRouter.delete("/:projectId/likes", validate(schemas.project.like), unlikeProject);
projectRouter.get("/:projectId/comments", getProjectComments);
projectRouter.post("/:projectId/comments", validate(schemas.project.addComment), addProjectComment);
projectRouter.delete("/:projectId/comments/:commentId", validate(schemas.project.deleteComment), deleteProjectComment);

export default projectRouter