import bcrypt from "bcryptjs";

export const hashPassword = async (password) => {
    try {
        const hashedPassword = await bcrypt.hash(password, 12);
        return hashedPassword;
    } catch (error) {
        throw new Error(error);
    }
}