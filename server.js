import express from "express";
import cors from "cors";
import { connectToMongoDb } from "./config/db.config.js";
import authRouter from "./routes/auth.routes.js";
import userRouter from "./routes/user.routes.js";
import cookieParser from "cookie-parser";
import { authorize } from "./middlewares/auth.middleware.js";
import projectRouter from "./routes/project.routes.js";
import testimonialRouter from "./routes/testimonial.routes.js";
import Visit from "./models/visit.model.js";
import { getMonthlyVisits } from "./controllers/visits.controllers.js";
import messageRouter from "./routes/message.routes.js";

const app = express();

const PORT = 5000 || process.env.PORT;

const allowedHeaders = [`${process.env.ADMIN_FRONTEND_URL}`, `${process.env.FRONTEND_URL}`]

const corsOptions = {
    origin : (origin, callback) => {
        if(!origin || allowedHeaders.includes(origin)){
            callback(null, true)
        }else{
            callback(new Error("Not allowed on this server"))
        }
    },
    methods : ["GET", "POST", "UPDATE", "DELETE", "PATCH"],
    credentials : true,
    // allowedHeaders : ["Content-Type", "Authorization"],
    // optionsSuccessStatus : 200
}

app.use(express.json());
app.use(cors(corsOptions));
app.use(cookieParser());

app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/projects", projectRouter);
app.use("/api/testimonials", testimonialRouter);
app.use("/api/messages", messageRouter)

app.post("/api/track-visits", async (req, res) => {
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent']
    try {
        await Visit.create({ ip : ip || "", userAgent });
        return res.status(200).json({ success : true })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message : "Internal server error"})
    }
});

app.get("/api/track-visits", authorize,  getMonthlyVisits);

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    connectToMongoDb()
})