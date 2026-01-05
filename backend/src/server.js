import dotenv from "dotenv";
import express from "express";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import messageRoutes from "./routes/message.route.js";

import { connectMongo } from "./lib/db/mongoDB.js";
import { app, server } from "./lib/socket.js";

dotenv.config();

const PORT = process.env.PORT;

//configs
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

//routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/message", messageRoutes);

server.listen(PORT, async () => {
  console.log(`server is running on port ${PORT}...`);
  await connectMongo();
});
