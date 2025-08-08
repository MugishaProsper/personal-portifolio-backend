import mongoose from "mongoose";

const testimonialSchema = mongoose.Schema({
    clientName : { type : String },
    clientRole : { type : String },
    project : { type : String },
    rating : { type : Number },
    message : { type : String },
    image : { type : String }
}, { timestamps : true });

const Testimonial = mongoose.model("testimonials", testimonialSchema);
export default Testimonial;