import Testimonial from "../models/testimonial.model.js";

export const getTestimonials = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const [items, total] = await Promise.all([
            Testimonial.find().sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
            Testimonial.countDocuments()
        ]);
        return res.status(200).json({ message: "Testimonials found", testimonials: items, pagination: { total, page: Number(page), limit: Number(limit) } });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" })
    }
};

export const addTestimonialComment = async (req, res) => {
    const { testimonialId } = req.params;
    const { message } = req.body;
    try {
        const t = await Testimonial.findById(testimonialId);
        if (!t) return res.status(404).json({ message: "Testimonial not found" });
        t.comments.push({ message });
        await t.save();
        return res.status(201).json({ message: "Comment added" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const deleteTestimonialComment = async (req, res) => {
    const { testimonialId, commentId } = req.params;
    try {
        const t = await Testimonial.findById(testimonialId);
        if (!t) return res.status(404).json({ message: "Testimonial not found" });
        const sub = t.comments.id(commentId);
        if (!sub) return res.status(404).json({ message: "Comment not found" });
        sub.remove();
        await t.save();
        return res.status(200).json({ message: "Comment deleted" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const createTestimonial = async (req, res) => {
    const { clientName, clientRole, project, rating, message } = req.body;
    try {
        const existingTestimonial = await Testimonial.findOne({ $or: [{ clientName: clientName }, { project: project }] });
        if (existingTestimonial) return res.status(403).json({ message: "You have already added this" });
        const image = `https://ui-avatars.com/api/?name=${encodeURIComponent(clientName)}`
        const testimonial = new Testimonial({
            clientName, clientRole, project, rating, message, image
        });
        await testimonial.save();
        return res.status(200).json({ message: "Testimonial created" })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" })
    }
}