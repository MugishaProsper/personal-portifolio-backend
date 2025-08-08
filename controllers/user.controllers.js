import User from "../models/user.model.js";

export const getLoggedInUser = async (req, res) => {
    const { id } = req.user;
    const token = req.cookies?.token;
    try {
        if(!token){
            return res.status(403).json({ message : "Not logged in" })
        }
        const user = await User.findById(id);
        if(!user){
            return res.status(404).json({ message : "User not found" });
        };
        return res.status(200).json({ message : "User found", user : user.getProfile() })
    } catch (error) {
        console.log(error)
    }
};

export const getRecentActivity = async (req, res) => {
    const { id } = req.user;
    try {
        const user = await User.findById(id);
        const { recentActivity } = await user.getRecentActivity();
        if(!recentActivity) return res.status(403).json({ message : "recent activities not found" });
        return res.status(200).json({ message : "Recent activities found", recentActivities : recentActivity })
    } catch (error) {
        return res.status(500).json({ message : "Internal server error" })
    }
};

export const getDashboardStats = async (req, res) => {
    const { id } = req.user;
    try {
        const user = await User.findById(id);
        if(!user) return res.status(404).json({ message : "User not found" });
        return res.status(200).json({ message : "Dashboard stats found", dashboardStats : [ user.getProjectsStats(), user.getSubscriptionsStats(), user.getInteractionsStats(), user.getSkillsStats() ] })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message : "internal server eror" })
    }
}