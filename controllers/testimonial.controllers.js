import Testimonial from "../models/testimonial.model.js";

export const getTestimonials = async (req, res) => {
    try {
        const testimonials = await Testimonial.find();
        return res.status(200).json({ message : "Testimonials found", testimonials : testimonials });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message : "Internal server error" })
    }
};

export const createTestimonial = async (req, res) => {
    const { clientName, clientRole, project, rating, message } = req.body;
    try {
        const existingTestimonial = await Testimonial.findOne({ $or : [{ clientName : clientName }, { project : project }]});
        if(existingTestimonial) return res.status(403).json({ message : "You have already added this" });
        const image = `https://ui-avatars.com/api/?name=${encodeURIComponent(clientName)}`
        const testimonial = new Testimonial({
            clientName, clientRole, project, rating, message, image
        });
        await testimonial.save();
        return res.status(200).json({ message : "Testimonial created" })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message : "Internal server error" })
    }
}