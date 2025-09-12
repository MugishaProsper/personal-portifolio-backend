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
import { notFound, errorHandler } from "./middlewares/error.middleware.js";
import helmet from "helmet";
import hpp from "hpp";
import xssClean from "xss-clean";
import mongoSanitize from "express-mongo-sanitize";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import logger from "./utils/logger.js";
import { loadEnv } from "./config/env.config.js";
import swaggerUi from "swagger-ui-express";
import swaggerJSDoc from "swagger-jsdoc";

loadEnv();
const app = express();

// Trust proxy (needed for secure cookies when behind a proxy/load balancer)
app.set('trust proxy', 1);

const PORT = process.env.PORT || 5000;

const envOrigins = [process.env.ADMIN_FRONTEND_URL, process.env.FRONTEND_URL].filter(Boolean);
const defaultOrigins = ['http://localhost:5173', 'http://localhost:5174', 'https://mugishaprosper-seven.vercel.app', 'https://adminpolo.vercel.app'];
const allowedHeaders = [...new Set([...envOrigins, ...defaultOrigins])]

const corsOptions = {
    origin: (origin, callback) => {
        const normalized = origin?.replace(/\/$/, '');
        const isAllowed = !normalized || allowedHeaders.some(o => o.replace(/\/$/, '') === normalized);
        if (isAllowed) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS', allowedHeaders))
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    optionsSuccessStatus: 200
}

// Security middlewares
app.use(helmet());
app.use(hpp());
app.use(xssClean());
app.use(mongoSanitize());

// Basic rate limiting to mitigate abuse
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
});

app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '200kb' }));
app.use(cors(corsOptions));
app.use(cookieParser());
app.use('/api', apiLimiter);

app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/projects", projectRouter);
app.use("/api/testimonials", testimonialRouter);
app.use("/api/messages", messageRouter)

app.post("/api/track-visits", async (req, res) => {
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent']
    try {
        await Visit.create({ ip: ip || "", userAgent });
        return res.status(200).json({ success: true })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" })
    }
});

app.get("/api/track-visits", authorize, getMonthlyVisits);

// Swagger docs
const swaggerSpec = swaggerJSDoc({
    definition: {
        openapi: '3.0.0',
        info: { title: 'Portfolio API', version: '1.0.0' },
        servers: [{ url: '/' }]
    },
    apis: []
});
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// 404 handler
app.use(notFound);
// Error handler must be last
app.use(errorHandler);

let server;
server = app.listen(PORT, () => {
    logger.info(`Server running on http://localhost:${PORT}`);
    connectToMongoDb()
});

// Health and readiness endpoints
app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));
app.get('/ready', (req, res) => res.status(200).json({ status: 'ready' }));

const gracefulShutdown = () => {
    logger.info('Received shutdown signal, closing server...');
    if (server) {
        server.close(() => {
            logger.info('HTTP server closed');
            process.exit(0);
        });
        // Force exit if not closed in time
        setTimeout(() => {
            logger.error('Forcing shutdown');
            process.exit(1);
        }, 10000).unref();
    }
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);