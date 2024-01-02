const fs = require("fs");
const path = require("path");

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
      Group.create({ id: 1, name: "The Chat Hub" });
    }
  })
  .then(() => {
    app.listen(process.env.PORT || 3000);
  })
  .catch((err) => {
    console.error(err);
  });
