import cloudinary from "../config/cloudinary.config.js";

export const uploadFileToCloudinary = async (file) => {
    try {
        const base64 = file.buffer.toString('base64');
        const uri = `data:${file.mimetype};base64,${base64}`;
        const result = await cloudinary.uploader.upload(uri, {
            resource_type : 'auto'
        });
        return { url : result.secure_url }
    } catch (error) {
        throw new Error(error);
    }
}