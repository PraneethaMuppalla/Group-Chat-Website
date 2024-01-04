const fs = require("fs");
const path = require("path");
const { createServer } = require("node:http");

const { Server } = require("socket.io");
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

dotenv.config();

const sequelise = require("./util/database");
const User = require("./models/user");
const Message = require("./models/message");
const Group = require("./models/group");
const GroupMember = require("./models/groupMember");
const userRoutes = require("./routes/user");
const msgRoutes = require("./routes/message");
const groupRoutes = require("./routes/group");

const accessLogStream = fs.createWriteStream(
  path.join(__dirname, "access.log"),
  { flags: "a" }
);

//middleware
const app = express();
const server = createServer(app);
app.use(cors());
app.use(express.json());

app.use(helmet());
app.use(morgan("combined", { stream: accessLogStream }));

//routes
app.use("/user", userRoutes);
app.use("/msg", msgRoutes);
app.use("/grp", groupRoutes);

User.hasMany(Message);
Message.belongsTo(User);

User.belongsToMany(Group, { through: GroupMember });
Group.belongsToMany(User, { through: GroupMember });

Group.hasMany(Message);
Message.belongsTo(Group);

sequelise
  .sync()
  .then(() => {
    return Group.findByPk(1);
  })
  .then((group) => {
    if (!group) {
      return Group.create({ id: 1, name: "The Chat Hub" });
    }
  })
  .then(() => {
    server.listen(process.env.PORT || 3000);
  })
  .catch((err) => {
    console.error(err);
  });

//new instance of socket.io by passing the server object
const io = new Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: ["http://127.0.0.1:5500", "https://admin.socket.io"],
    credentials: true,
  },
});

//listen on the connection event for incoming sockets and log them to the console
io.on("connection", (socket) => {
  //joining group ids room
  socket.on("join group", (groupId) => {
    console.log("groupId");
    socket.join(groupId);
  });
  socket.on("new msg", (msgToBeSent, name, currentGroupId) => {
    if (!currentGroupId) return console.log("nothing to be sent");
    socket.to(currentGroupId).emit("receive msg", msgToBeSent, name);
  });
});

//to connect to admin dashboard
const { instrument } = require("@socket.io/admin-ui");
instrument(io, { auth: false });
