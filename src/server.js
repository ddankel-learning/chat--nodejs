const path = require("path");
const http = require("http");
const express = require("express");
const { Server } = require("socket.io");
const Filter = require("bad-words");

const { generateMessage, generateLocationMessage } = require("./utils/messages");
const { addUser, removeUser, getUser, getUsersInRoom } = require("./utils/users");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, "../public")));

io.on("connection", (socket) => {
  /**
   * Handle `join` event
   *
   * - Respond with callback containing error message if an error occurs
   * - Add the user to the room
   * - Emit a welcome message to the user
   * - Broadcast a new user alert to the room
   * - Emit a roomData event with the updated room roster
   */
  socket.on("join", ({ username, room }, callback) => {
    const { user, error } = addUser({ id: socket.id, username, room });
    if (error) return callback(error);

    socket.join(user.room);
    socket.emit("message", generateMessage({ text: `Welcome, ${user.username}!` }));
    socket.broadcast.to(user.room).emit("message", generateMessage(`${user.username} has joined.`));
    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(user.room),
    });
    callback();
  });

  /**
   * Handle `sendMessage` event
   *
   * - Respond with callback containing an error message if an error occurs
   * - Filter message for profanity
   * - Emit message to the room's roster
   */
  socket.on("sendMessage", (message, callback) => {
    const filter = new Filter();
    if (filter.isProfane(message)) return callback("Profanity is not allowed");

    const user = getUser(socket.id);
    const messageObject = generateMessage({ username: user.username, text: message });

    io.to(user.room).emit("message", messageObject);
    callback();
  });

  /**
   * Handle `sendLocation` event
   *
   * - Emit a message to the room's roster with the location url
   */
  socket.on("sendLocation", (coordinates, callback) => {
    const { latitude, longitude } = coordinates;
    const user = getUser(socket.id);
    const messageObject = generateLocationMessage({ username: user.username, latitude, longitude });
    io.to(user.room).emit("locationMessage", messageObject);
    callback();
  });

  /**
   * Handle `disconnect` event
   *
   * - Remove the user from the room/session
   * - Emit a notification to remaining users of the departure
   * - Emit updated room roster to remaining users
   */
  socket.on("disconnect", () => {
    const user = removeUser(socket.id);

    if (user) {
      io.to(user.room).emit("message", generateMessage(`${user.username} has left the room.`));
      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUsersInRoom(user.room),
      });
    }
  });
});

// Listen on defined port
const port = process.env.PORT || 3000;
server.listen(port, () => console.log(`Server listening at http://localhost:${port}`));
