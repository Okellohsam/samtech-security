const Message = require("../models/Message");
const User = require("../models/User");

const connectedUsers = {};

function chatSocket(io) {
  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    socket.on("register-user", (username) => {
      if (!username) return;
      connectedUsers[username] = socket.id;
      console.log(`Registered ${username} -> ${socket.id}`);
    });

    socket.on("sendMessage", async (data) => {
      try {
        const { fromUsername, toUsername, message } = data;

        if (!fromUsername || !toUsername || !message) return;

        const fromUser = await User.findOne({ username: fromUsername });
        const toUser = await User.findOne({ username: toUsername });

        if (!fromUser || !toUser) return;

        const newMsg = await Message.create({
          from: fromUser._id,
          to: toUser._id,
          message
        });

        const populatedMsg = await Message.findById(newMsg._id)
          .populate("from", "name username")
          .populate("to", "name username");

        if (connectedUsers[toUsername]) {
          io.to(connectedUsers[toUsername]).emit("receiveMessage", populatedMsg);
        }

        if (connectedUsers[fromUsername]) {
          io.to(connectedUsers[fromUsername]).emit("receiveMessage", populatedMsg);
        }
      } catch (error) {
        console.log("Socket chat error:", error.message);
      }
    });

    socket.on("disconnect", () => {
      Object.keys(connectedUsers).forEach((username) => {
        if (connectedUsers[username] === socket.id) {
          delete connectedUsers[username];
        }
      });
      console.log("Socket disconnected:", socket.id);
    });
  });
}

module.exports = chatSocket;