import dotenv from "dotenv";
import express from "express";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import messageRoutes from "./routes/message.route.js";

import { connectMongo } from "./configs/db/mongoDB.js";

dotenv.config();

const app = express();

const PORT = process.env.PORT;

//configs
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

//routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/message", messageRoutes);

app.listen(PORT, async () => {
  console.log(`server is running on port ${PORT}...`);
  await connectMongo();
});
