import mongoose from "mongoose";

const userSchema = mongoose.Schema({
    fullname: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    username: { type: String, unique: true, sparse: true, index: true },
    password: { type: String, required: true },
    statistics: {
        projects: {
            count: { type: Number, default: 0 },
            value: { type: Number, default: 0.0 },
            sign: { type: String, enum: ["+", "-", ""], default: "" },
            percentage: { type: Number }
        },
        testimonials: {
            count: { type: Number, default: 0 },
            value: { type: Number, default: 0.0 },
            sign: { type: String, enum: ["+", "-", ""], default: "" },
            percentage: { type: Number }
        },
        interactions: {
            count: { type: Number, default: 0 },
            value: { type: Number, default: 0.0 },
            sign: { type: String, enum: ["+", "-", ""], default: "" },
            percentage: { type: Number }
        },
        activity: [{
            type: { type: String, enum: ["LOGIN", "UPDATE", "SUBSCRIPTION", "CREATE"] },
            description: { type: String },
            createdAt: { type: Date, default: Date.now }
        }]
    }
}, { timestamps: true });

userSchema.index({ createdAt: -1 });

userSchema.methods.getProfile = function () {
    return {
        id: this._id,
        fullname: this.fullname,
        email: this.email,
        username: this.username
    }
};

userSchema.methods.getRecentActivity = async function (limit = 4) {
    try {
        if (!this.statistics.activity || !Array.isArray(this.statistics.activity)) return [];

        return { recentActivity: this.statistics.activity.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, limit) };
    } catch (error) {
        throw new Error(error);
    }
}

userSchema.methods.getProjectsStats = function () {
    try {
        if (!this.statistics) return {};
        return this.statistics.projects;
    } catch (error) {
        throw new Error(error);
    }
};
userSchema.methods.getInteractionsStats = function () {
    try {
        return this.statistics.interactions;
    } catch (error) {
        throw new Error(error)
    }
}

userSchema.methods.getTestimoniesStats = function () {
    try {
        return this.statistics.testimonials
    } catch (error) {
        throw new Error(error)
    }
}

const User = mongoose.model("users", userSchema);
export default User;