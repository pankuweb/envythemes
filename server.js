const mongoose = require("mongoose");
const dotenv = require("dotenv");
const socket = require("socket.io");
const http = require("http");
process.on("uncaughtException", (err) => {
  console.log("UNCAUGHT EXCEPTION! 💥 Shutting down...");
  console.log(err);
  // process.exit(1);
});

dotenv.config({ path: "./config.env" });
const app = require("./app");

mongoose.set("strictQuery", false);

mongoose
  .connect(process.env.DATABASE, {
    useNewUrlParser: true,
  })
  .then(() => console.log("DB connection successful!"));

const port = process.env.PORT || 4000;

const server = http.createServer(app);

process.on("unhandledRejection", (err) => {
  console.log("UNHANDLED REJECTION! 💥 Shutting down...");
  console.log(err.name, err.message);
});

const io = new socket.Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
    transports: ["websocket", "polling"],
  },
  allowEIO3: true,
});

io.on("connection", (socket) => {
  console.log("A user is connected", `${socket.id}`);

  socket.on("message", (message) => {
    console.log(`message from ${socket.id} : ${message}`);
  });

  socket.on("disconnect", () => {
    console.log(`socket ${socket.id} disconnected`);
  });
});

app.set("io", io);
server.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
