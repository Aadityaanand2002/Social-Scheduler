import "dotenv/config";
import express from 'express';
import cors from "cors";
import connectDB from "./config/db.js";
import authRouter from "./routes/authRoutes.js";
import socialAuthRouter from "./routes/socialAuthRoutes.js";
import accountRouter from "./routes/accountRoutes.js";
import postRouter from "./routes/postRoutes.js";
import activityRouter from "./routes/activityRoutes.js";
import billingRouter from "./routes/billingRoutes.js";
import { initScheduler } from "./services/schedulerService.js";
const app = express();
const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
await connectDB();
app.use(cors({ origin: clientUrl }));
app.use(express.json());
const port = process.env.PORT || 3000;
app.get('/', (_req, res) => {
    res.send('Server is Live!');
});
app.use("/api/auth", authRouter);
app.use("/api/oauth", socialAuthRouter);
app.use("/api/accounts", accountRouter);
app.use("/api/posts", postRouter);
app.use("/api/activity", activityRouter);
app.use("/api/billing", billingRouter);
initScheduler();
app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).send(err?.response?.data?.message || err?.message);
});
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
