import cloudinary from "../config/cloudinary.config.js";

export const uploadFileToCloudinary = async (file) => {
    try {
        const base64 = file.buffer.toString('base64');
        const uri = `data:${file.mimetype};base64,${base64}`;
        const result = await cloudinary.uploader.upload(uri, {
            resource_type : 'auto',
            timeout: 60000
        });
        return { url : result.secure_url }
    } catch (error) {
        throw new Error(error);
    }
}

export const uploadFilesToCloudinary = async (files = []) => {
    if (!Array.isArray(files) || files.length === 0) return [];
    const uploads = files.map(async (file) => {
        const base64 = file.buffer.toString('base64');
        const uri = `data:${file.mimetype};base64,${base64}`;
        const result = await cloudinary.uploader.upload(uri, { resource_type: 'auto', timeout: 60000 });
        return result.secure_url;
    });
    const results = await Promise.all(uploads);
    return results;
}