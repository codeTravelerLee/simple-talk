import dotenv from "dotenv";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import messageRoutes from "./routes/message.route.js";
import roomRoutes from "./routes/room.route.js";

import { connectMongo } from "./lib/db/mongoDB.js";
import { app, server } from "./lib/socket.js";

import { initJobs } from "./jobs/index.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

//configs
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "development"
        ? process.env.CLIENT_URI
        : undefined,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  }),
);

app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

//routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/message", messageRoutes);
app.use("/api/v1/room", roomRoutes); //채팅방 관련

server.listen(PORT, async () => {
  console.log(`server is running on port ${PORT}...`);
  await connectMongo();
  initJobs(); //batch작업 연동
});
