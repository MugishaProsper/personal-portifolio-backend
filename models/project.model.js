import mongoose from "mongoose";

const projectSchema = mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    projectName: { type: String, required: true },
    projectUrl: { type: String, required: true },
    sampleImage: { type: String, required: true },
    sampleImages: [{ type: String }],
    projectDescription: { type: String, required: true },
    categories: [{ type: String }],
    technologies: [{ type: String }],
    projectStatus: { type: String, enum: ["PLANNING", "IN_PROGRESS", "COMPLETED"] },
    statistics: {
        likes: { type: Number, default: 0 },
        comments_count: { type: Number, default: 0 },
        comments: [{
            message: { type: String },
            timestamps: { type: Date, default: Date.now }
        }]
    }
}, { timestamps: true });

projectSchema.index({ createdAt: -1 });

projectSchema.methods.getProjectStatistics = async function (limit = 5) {
    try {
        if (!this.statistics) return {};
        return [this.statistics];
    } catch (error) {
        throw new Error(error)
    }
};

projectSchema.methods.getProjectDetails = async function () {
    try {
        return {
            _id : this._id,
            projectName : this.projectName,
            projectDescription : this.projectDescription,
            projectUrl : this.projectUrl,
            projectStatus : this.projectStatus,
            sampleImage : this.sampleImage,
            categories : this.categories,
            technologies : this.technologies,
            likes : this.statistics.likes,
            comments_count : this.statistics.comments_count,
            createdAt : this.createdAt
        }
    } catch (error) {
        throw new Error(error);
    }
}

projectSchema.methods.likeProject = async function () {
    try {
        this.statistics.likes += 1;
    } catch (error) {
        throw new Error(error);
    }
}

projectSchema.methods.unlikeProject = async function () {
    try {
        this.statistics.likes -= 1;
    } catch (error) {
        throw new Error(error);
    }
};

projectSchema.methods.getProjectComments = async function () {
    try {
        if (!this.statistics.comments || !Array.isArray(this.statistics.comments)) return [];
        return this.statistics.comments.sort((a, b) => new Date(b.timestamps) - new Date(a.timestamps));
    } catch (error) {
        throw new Error(error);
    }
}

const Project = new mongoose.model("projects", projectSchema);
export default Project