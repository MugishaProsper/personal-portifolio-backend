import Project from "../models/project.model.js";
import User from "../models/user.model.js";
import Testimonial from "../models/testimonial.model.js";
import Visit from "../models/visit.model.js"

export const getAndUpdateProjectsStats = async (userId) => {
    try {
        const user = await User.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }
        const project_count = await Project.find({ user: user._id }).countDocuments();
        const currentStats = user.getProjectsStats();
        const previousValue = currentStats.value || 0;

        // Calculate percentage change only if project_count is not 0
        const changePercentage = project_count !== 0
            ? ((project_count - previousValue) / project_count) * 100
            : 0;

        // Update user statistics
        user.statistics.projects = {
            value: previousValue, // Keep track of previous count
            count: project_count, // Current count
            sign: project_count > previousValue ? "+" :
                project_count < previousValue ? "-" : "",
            percentage: Math.abs(changePercentage).toFixed(2)
        };

        await user.save();

        // Update related projects if needed
        await Project.updateMany(
            { user: user._id },
            { $set: { lastSync: new Date() } }
        );

        return user.statistics.projects;

    } catch (error) {
        throw new Error(`Failed to update project statistics: ${error.message}`);
    }
}

export const getAndUpdateTestimoniesStats = async (userId) => {
    try {
        const user = await User.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        const testimonies_count = await Testimonial.find().countDocuments();
        const currentStats = user.getTestimoniesStats();
        const previousValue = currentStats.value || 0;

        // Calculate percentage change only if project_count is not 0
        const changePercentage = testimonies_count !== 0 
            ? ((testimonies_count - previousValue) / testimonies_count) * 100 
            : 0;

        // Update user statistics
        user.statistics.testimonials = {
            value: previousValue, // Keep track of previous count
            count: testimonies_count, // Current count
            sign: testimonies_count > previousValue ? "+" : 
                  testimonies_count < previousValue ? "-" : "",
            percentage: Math.abs(changePercentage).toFixed(2)
        };

        await user.save();
        
        // Update related projects if needed
        await Testimonial.updateMany(
            { user: user._id },
            { $set: { lastSync: new Date() } }
        );
        return user.statistics.testimonials;
    } catch (error) {
        throw new Error(`Failed to update testimonies statistics: ${error.message}`);
    }
}

export const getInteractionStats = async (userId) => {
        try {
        const user = await User.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        const visits_count = await Visit.find().countDocuments();
        const currentStats = user.getInteractionsStats();
        const previousValue = currentStats.value || 0;

        // Calculate percentage change only if project_count is not 0
        const changePercentage = visits_count !== 0 
            ? ((visits_count - previousValue) / visits_count) * 100 
            : 0;

        // Update user statistics
        user.statistics.interactions = {
            value: previousValue, // Keep track of previous count
            count: visits_count, // Current count
            sign: visits_count > previousValue ? "+" : 
                  visits_count < previousValue ? "-" : "",
            percentage: Math.abs(changePercentage).toFixed(2)
        };

        await user.save();
        
        // Update related projects if needed
        await Visit.updateMany(
            { $set: { lastSync: new Date() } }
        );
        return user.statistics.interactions;
    } catch (error) {
        throw new Error(`Failed to update interaction statistics: ${error.message}`);
    }
}

export const getDashboardStats = async (req, res) => {
    const { id } = req.user;
    try {
        const project_stats = await getAndUpdateProjectsStats(id);
        const testimonies_stats = await getAndUpdateTestimoniesStats(id);
        const visits_stats = await getInteractionStats(id)
        return res.status(200).json({ message: "Stats updated", dashboardStats: [project_stats, testimonies_stats, visits_stats] })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" })
    }
}