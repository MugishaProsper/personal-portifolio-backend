import mongoose from "mongoose";

const visitSchema = mongoose.Schema({
    ip : String,
    userAgent : String
}, { timestamps : true });

const Visit = mongoose.model("visits", visitSchema);
export default Visit