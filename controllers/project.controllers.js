import Project from "../models/project.model.js";
import User from "../models/user.model.js";
import { uploadFileToCloudinary } from "../utils/image.upload.js";

export const createProject = async (req, res) => {
    const { id } = req.user;
    let { projectName, projectUrl, projectDescription, categories, technologies, projectStatus } = req.body;
    categories = categories ? JSON.parse(categories) : [];
    technologies = technologies ? JSON.parse(technologies) : []
    console.log(typeof(categories), categories);
    console.log(typeof(technologies), categories)
    if(!req.file){
        return res.status(404).json({ message : "File not found" });
    }
    try {
        const { url } = await uploadFileToCloudinary(req.file);
        if(!url) return res.status(403).json({ message : "File upload failed" });
        const project = new Project({
            user: id,
            projectName,
            projectUrl,
            sampleImage : url,
            projectDescription,
            categories,
            technologies,
            projectStatus
        });
        await project.save();
        const user = await User.findById(id);
        user.statistics.activity.push({
            type :"CREATE",
            description : "Created project succesfully",
            timestamps : Date.now()
        })
        return res.status(200).json({ message: "Project created" })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Internal server error" })
    }
};

export const getAllProjects = async (req, res) => {
    try {
        const projects = await Project.find();
        if (!projects || projects.length === null) return res.status(404).json({ message: "No projects found" });
        projects.forEach(project => {
            project = project.getProjectDetails();
        });
        return res.status(200).json({ message: "Projects found", projects: projects })
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

export const updateProject = async (req, res) => {
    const { id } = req.user;
    const { projectName, projectUrl, sampleImage, projectDescription, categories, projectStatus, technologies } = req.body;
    try {
        const project = await Project.findOneAndUpdate({ user: id }, { projectName: projectName, projectUrl: projectUrl, sampleImage: sampleImage, projectDescription: projectDescription, categories: categories, technologies: technologies, projectStatus: projectStatus });
        if (!project) return res.status(404).json({ message: "Project not found" });
        return res.status(200).json({ message: "Project updated" });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" })
    }
};

export const deleteProject = async (req, res) => {
    const { id } = req.user;
    try {
        const project = await Project.findOneAndDelete({ user: id });
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
        return res.status(200).json({ message: "Project unliked" })
    } catch (error) {

    }
}