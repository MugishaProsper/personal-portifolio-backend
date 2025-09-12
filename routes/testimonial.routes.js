import express from "express";
import { createTestimonial, getTestimonials, addTestimonialComment, deleteTestimonialComment } from "../controllers/testimonial.controllers.js";
import { validate, schemas } from "../middlewares/validate.middleware.js";

const testimonialRouter = express.Router();

testimonialRouter.get("/", getTestimonials);
testimonialRouter.post("/", validate(schemas.testimonial.create), createTestimonial);
testimonialRouter.post("/:testimonialId/comments", validate(schemas.testimonial.addComment), addTestimonialComment);
testimonialRouter.delete("/:testimonialId/comments/:commentId", validate(schemas.testimonial.deleteComment), deleteTestimonialComment);

export default testimonialRouter