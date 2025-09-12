import Message from "../models/message.model.js";

export const getAllMessages = async (req, res) => {
    try {
        const { page = 1, limit = 20, status, priority } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const filter = {};
        if (status === 'unread') filter['status.read'] = false;
        if (status === 'read') filter['status.read'] = true;
        if (priority) filter['priority'] = priority;
        const [items, total] = await Promise.all([
            Message.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
            Message.countDocuments(filter)
        ]);
        return res.status(200).json({ message: "Messages found", messages: items, pagination: { total, page: Number(page), limit: Number(limit) } });
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

export const markMessageRead = async (req, res) => {
    const { messageId } = req.params;
    try {
        const msg = await Message.findByIdAndUpdate(messageId, { $set: { 'status.read': true, 'status.unread_count': 0 } }, { new: true });
        if (!msg) return res.status(404).json({ message: 'Message not found' });
        return res.status(200).json({ message: 'Message marked as read' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const getUnreadCount = async (req, res) => {
    try {
        const count = await Message.countDocuments({ 'status.read': false });
        return res.status(200).json({ message: 'Unread count', count });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};