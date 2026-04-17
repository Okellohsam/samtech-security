const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

const connectDB = require("./config/db");
const chatSocket = require("./socket/chat");

const app = express();
const server = http.createServer(app);

connectDB();

const allowedOrigins = [
  "http://localhost:5500",
  "http://127.0.0.1:5500",
  "https://YOUR-NETLIFY-SITE.netlify.app",
  "https://www.samtechsecurity.com"
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.use(express.json());

app.get("/", (req, res) => {
  res.send("SAMTECH API is running");
});

app.use("/api/auth", require("./routes/auth"));
app.use("/api/jobs", require("./routes/jobs"));
app.use("/api/applications", require("./routes/applications"));
app.use("/api/messages", require("./routes/messages"));
app.use("/api/users", require("./routes/users"));
app.use("/api/admin", require("./routes/admin"));

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true
  }
});

chatSocket(io);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});