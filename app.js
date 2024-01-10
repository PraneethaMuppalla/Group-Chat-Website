const fs = require("fs");
const path = require("path");
const http = require("http");

const { Server } = require("socket.io");
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

dotenv.config();

const sequelise = require("./utils/database");
const CronJob = require("./services/cron-job");
const User = require("./models/user");
const Message = require("./models/message");
const Group = require("./models/group");
const GroupMember = require("./models/group-member");
const ArchievedMessage = require("./models/archieved-message");
const ForgotPassword = require("./models/forgot-password");
const userRoutes = require("./routes/user");
const messageRoutes = require("./routes/message");
const groupRoutes = require("./routes/group");
const forgotPasswordRoutes = require("./routes/forgot-password");

const accessLogStream = fs.createWriteStream(
  path.join(__dirname, "access.log"),
  { flags: "a" }
);

//middleware
const app = express();
const server = http.createServer(app);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(helmet());
app.use(morgan("combined", { stream: accessLogStream }));

//routes
app.use("/user", userRoutes);
app.use("/message", messageRoutes);
app.use("/group", groupRoutes);
app.use("/password", forgotPasswordRoutes);

User.hasMany(Message, { foreignKey: "senderId" });
Message.belongsTo(User, { foreignKey: "senderId" });
ArchievedMessage.belongsTo(User, { foreignKey: "senderId" });

User.belongsToMany(Group, { through: GroupMember, foreignKey: "userId" });
Group.belongsToMany(User, { through: GroupMember, foreignKey: "groupId" });

Group.hasMany(Message, { foreignKey: "groupId" });
Message.belongsTo(Group, { foreignKey: "groupId" });
Group.hasMany(ArchievedMessage, { foreignKey: "groupId" });
ArchievedMessage.belongsTo(Group, { foreignKey: "groupId" });

User.hasMany(ForgotPassword);
ForgotPassword.belongsTo(User);

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
  socket.on("new message", (messageToBeSent, name, currentGroupId) => {
    if (!currentGroupId) return console.log("nothing to be sent");
    socket.to(currentGroupId).emit("receive message", messageToBeSent, name);
  });
});

//to connect to admin dashboard
const { instrument } = require("@socket.io/admin-ui");
instrument(io, { auth: false });
