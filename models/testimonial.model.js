import mongoose from "mongoose";

const testimonialSchema = mongoose.Schema({
    clientName: { type: String },
    clientRole: { type: String },
    project: { type: String },
    rating: { type: Number },
    message: { type: String },
    image: { type: String },
    comments: [{
        message: { type: String },
        createdAt: { type: Date, default: Date.now }
    }]
}, { timestamps: true });

testimonialSchema.index({ createdAt: -1 });

const Testimonial = mongoose.model("testimonials", testimonialSchema);
export default Testimonial;