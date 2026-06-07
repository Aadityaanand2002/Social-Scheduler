import "dotenv/config";
import express, { NextFunction, Request, Response } from 'express';
import cors from "cors";
import connectDB from "./config/db.js";
import authRouter from "./routes/authRoutes.js";
import socialAuthRouter from "./routes/socialAuthRoutes.js";
import accountRouter from "./routes/accountRoutes.js";
import postRouter from "./routes/postRoutes.js";
import activityRouter from "./routes/activityRoutes.js";
import billingRouter from "./routes/billingRoutes.js";
import supportRouter from "./routes/supportRoutes.js";
import { initScheduler } from "./services/schedulerService.js";

const app = express();
const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";

await connectDB();

app.use(cors({ origin: clientUrl }));
app.use(express.json());

const port = process.env.PORT || 3000;

app.get('/', (_req: Request, res: Response) => {
    res.send('Server is Live!');
});

app.use("/api/auth", authRouter)
app.use("/api/oauth", socialAuthRouter)
app.use("/api/accounts", accountRouter)
app.use("/api/posts", postRouter)
app.use("/api/activity", activityRouter)
app.use("/api/billing", billingRouter)
app.use("/api/support", supportRouter)

initScheduler()

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err);
    res.status(500).send(err?.response?.data?.message || err?.message)
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
