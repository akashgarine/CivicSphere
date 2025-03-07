import express from "express";
import "dotenv/config";
import projectRouter from "./routes/project.route.js";
import userRouter from "./routes/user.route.js";
import paymentRouter from "./routes/payment.route.js";
import resourceRouter from "./routes/resource.route.js";
import connectDb from "./utils/connectDb.js";
import issueRouter from "./routes/issue.route.js";
import cors from "cors";
import http from "http";
import cookieParser from "cookie-parser";
import multer from "multer";
import locationRouter from "./routes/location.route.js";
import uploadToS3 from "./utils/AWSUpload.js";
import chatSocket from "./sockets/chatSocket.js";
import { Server } from "socket.io";

import emergencyRouter from "./routes/emergency.route.js";
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: "GET, POST, PUT, DELETE, OPTIONS",
    allowedHeaders: "Content-Type, Authorization, Cache-Control",
    credentials: true,
  })
);
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });

// Connect to Database
connectDb();

// Initialize Chat Socket
chatSocket(io);

// File Upload Route
app.post("/api/v1/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    const fileUrl = await uploadToS3(req.file);
    res.status(200).json({ fileUrl });
  } catch (error) {
    console.error("Upload Error:", error);
    res.status(500).json({ error: "File upload failed" });
  }
});

// Routes
app.use("/api/auth", userRouter);
app.use("/api/project", projectRouter);
app.use("/api/resources", resourceRouter);
app.use("/api/issues", issueRouter);
app.use("/api/payments", paymentRouter);
app.use("/api/location", locationRouter);
import chatRouter from "./routes/chat.route.js";  // ✅ Import chat routes
app.use("/api/chat", chatRouter); 
// import emergencyRouter from "./routes/emergency.route.js";
app.use("/api/emergency", emergencyRouter);
// Start Server
const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
