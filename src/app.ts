import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import express from "express";
import logger from "morgan";
import cors from "cors";
import path from "path";
import { getHueClient } from "./lib/hue";
import lightsRouter from "./routes/lights";
import rateLimiter from "express-rate-limit";

const limiter = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

dotenv.config();

var app = express();

app.use(limiter);
app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/api/lights", lightsRouter);

// @ts-ignore
app.use((a, b, c, d) => {
  console.log({ a, b, c, d });
});

module.exports = app;
