import express from "express";
import { createTestimonial, getTestimonials } from "../controllers/testimonial.controllers.js";

const testimonialRouter = express.Router();

testimonialRouter.get("/", getTestimonials);
testimonialRouter.post("/", createTestimonial);

export default testimonialRouter