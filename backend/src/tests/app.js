//test를 위한 환경
//실제 구동은 server.js

import dotenv from "dotenv";
import express from "express";
import cookieParser from "cookie-parser";

import authRoutes from "../routes/auth.route.js";

dotenv.config();

const app = express();

//configs
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

//routes
app.use("/api/v1/auth", authRoutes);

export default app;
