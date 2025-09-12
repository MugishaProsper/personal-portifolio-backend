import Project from "../models/project.model.js";
import User from "../models/user.model.js";
import { uploadFileToCloudinary, uploadFilesToCloudinary } from "../utils/image.upload.js";

export const createProject = async (req, res) => {
    const { id } = req.user;
    let { projectName, projectUrl, projectDescription, categories, technologies, projectStatus } = req.body;
    try { categories = typeof categories === 'string' ? JSON.parse(categories) : (categories || []); } catch { }
    try { technologies = typeof technologies === 'string' ? JSON.parse(technologies) : (technologies || []); } catch { }
    const files = {
        single: req.files?.sampleImage?.[0],
        multiple: req.files?.sampleImages || []
    };
    if (!files.single && files.multiple.length === 0) {
        return res.status(400).json({ message: "No files provided" });
    }
    try {
        let url = "";
        let urls = [];
        if (files.single) {
            const result = await uploadFileToCloudinary(files.single);
            url = result?.url;
        }
        if (files.multiple.length) {
            urls = await uploadFilesToCloudinary(files.multiple);
            if (!url && urls.length > 0) url = urls[0];
        }
        if (!url) return res.status(403).json({ message: "File upload failed" });
        const project = new Project({
            user: id,
            projectName,
            projectUrl,
            sampleImage: url,
            sampleImages: urls,
            projectDescription,
            categories,
            technologies,
            projectStatus
        });
        await project.save();
        const user = await User.findById(id);
        user.statistics.activity.push({
            type: "CREATE",
            description: "Created project succesfully",
            timestamps: Date.now()
        })
        return res.status(200).json({ message: "Project created" })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Internal server error" })
    }
};

export const getAllProjects = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const [items, total] = await Promise.all([
            Project.find().sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
            Project.countDocuments()
        ]);
        const transformed = await Promise.all(items.map(p => p.getProjectDetails()));
        return res.status(200).json({ message: "Projects found", projects: transformed, pagination: { total, page: Number(page), limit: Number(limit) } })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Internal server error" })
    }
};

export const getProject = async (req, res) => {
    const { projectId } = req.params;
    try {
        const project = await Project.findById(projectId);
        if (!project) return res.status(404).json({ message: "Project not found" });
        const projectToDisplay = await project.getProjectDetails();
        return res.status(200).json({ message: "Project found", project: projectToDisplay })
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const getProjectComments = async (req, res) => {
    const { projectId } = req.params;
    try {
        const project = await Project.findById(projectId);
        if (!project) return res.status(200).json({ message: "Project not found" });
        const comments = await project.getProjectComments();
        return res.status(200).json({ message: "Project comments found", comments: comments })
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const addProjectComment = async (req, res) => {
    const { projectId } = req.params;
    const { message } = req.body;
    try {
        const project = await Project.findById(projectId);
        if (!project) return res.status(404).json({ message: "Project not found" });
        project.statistics.comments.push({ message, timestamps: Date.now() });
        project.statistics.comments_count += 1;
        await project.save();
        return res.status(201).json({ message: "Comment added" });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const deleteProjectComment = async (req, res) => {
    const { projectId, commentId } = req.params;
    try {
        const project = await Project.findById(projectId);
        if (!project) return res.status(404).json({ message: "Project not found" });
        const subdoc = project.statistics.comments.id(commentId);
        if (!subdoc) return res.status(404).json({ message: "Comment not found" });
        subdoc.remove();
        project.statistics.comments_count = Math.max(0, project.statistics.comments_count - 1);
        await project.save();
        return res.status(200).json({ message: "Comment deleted" });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const updateProject = async (req, res) => {
    const { id } = req.user;
    const { projectId } = req.params;
    const { projectName, projectUrl, sampleImage, projectDescription, categories, projectStatus, technologies } = req.body;
    try {
        const project = await Project.findOneAndUpdate({ _id: projectId, user: id }, { projectName: projectName, projectUrl: projectUrl, sampleImage: sampleImage, projectDescription: projectDescription, categories: categories, technologies: technologies, projectStatus: projectStatus }, { new: true });
        if (!project) return res.status(404).json({ message: "Project not found" });
        return res.status(200).json({ message: "Project updated" });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" })
    }
};

export const deleteProject = async (req, res) => {
    const { id } = req.user;
    const { projectId } = req.params;
    try {
        const project = await Project.findOneAndDelete({ _id: projectId, user: id });
        if (!project) return res.status(404).json({ message: "Project not found" });
        return res.status(200).json({ message: "Project deleted" });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" })
    }
};

export const likeProject = async (req, res) => {
    const { projectId } = req.params;
    try {
        const project = await Project.findById(projectId);
        if (!project) return res.status(404).json({ message: "Project not found" });
        await project.likeProject();
        await project.save();
        return res.status(200).json({ message: "Project liked" })
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const unlikeProject = async (req, res) => {
    const { projectId } = req.params;
    try {
        const project = await Project.findById(projectId);
        if (!project) return res.status(404).json({ message: "Project not found" });
        await project.unlikeProject();
        if (project.statistics.likes < 0) project.statistics.likes = 0;
        await project.save();
        return res.status(200).json({ message: "Project unliked" })
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
}