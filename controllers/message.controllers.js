import Message from "../models/message.model.js";

export const getAllMessages = async (req, res) => {
    try {
        const messages = await Message.find();
        return res.status(200).json({ message: "Messages found", messages: messages });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" })
    }
};

export const sendMessage = async (req, res) => {
    const { name, email, subject, message } = req.body.message;
    try {
        await Message.create({ name, email, subject, message, status: { read: false, unread_count: 1 }, priority: 'high' });
        return res.status(200).json({ message: "Message sent. Thank you for reaching out" })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" })
    }
}