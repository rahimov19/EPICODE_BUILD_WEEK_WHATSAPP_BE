let onlineUsers = [];

export const newConnectionhandler = (socket) => {
  console.log("NEW CONNECTION:", socket.id);

  socket.emit("welcome", { message: `Hello ${socket.id}` });

  socket.on("setUsername", (payload) => {
    console.log(payload);
    onlineUsers.push({ username: payload.username, socketId: socket.id });

    socket.emit("loggedIn", onlineUsers);

    socket.broadcast.emit("updatedOnlineUsersList", onlineUsers);
  });

  socket.on("sendMessage", (message, room) => {
    console.log("NEW MESSAGE:", message, "ROOOOOOM", room);
    socket.to(room).emit("newMessage", message);
  });

  socket.on("join-room", (room) => {
    socket.join(room);
  });

  socket.on("disconnect", () => {
    onlineUsers = onlineUsers.filter((user) => user.socketId !== socket.id);
    socket.broadcast.emit("updateOnlineUsersList", onlineUsers);
  });
};
