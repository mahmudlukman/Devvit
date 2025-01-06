require("dotenv").config();
import express, { NextFunction, Request, Response } from "express";
export const app = express();
import cors from "cors";
import cookieParser from "cookie-parser";
import { errorMiddleware } from "./middleware/error";
import userRouter from "./routes/user.route";
import authRouter from "./routes/auth.route";
import questionRouter from "./routes/question.route";
import tagRouter from "./routes/tag.route";
import answerRouter from "./routes/answer.route";
import interactionRouter from "./routes/interaction.route";
import globalSearchRouter from "./routes/general.route";
import { limiter } from "./utils/rateLimiter";

// body parser
app.use(express.json({ limit: "50mb" }));
app.disable("x-powered-by");

// cookie parser
app.use(cookieParser());

// cors => Cross Origin Resource Sharing
app.use(
  cors({
    origin: ["https://dev-overflow.onrender.com"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
    credentials: true,
  })
);

// routes
app.use(
  "/api/v1",
  userRouter,
  authRouter,
  questionRouter,
  tagRouter,
  answerRouter,
  interactionRouter,
  globalSearchRouter
);

// testing API
app.get("/test", (req: Request, res: Response, next: NextFunction) => {
  res.status(200).json({ success: true, message: "API is working" });
});

// unknown route
app.all("*", (req: Request, res: Response, next: NextFunction) => {
  const err = new Error(`Route ${req.originalUrl} not found`) as any;
  err.statusCode = 404;
  next(err);
});

app.use(limiter);
app.use(errorMiddleware);
