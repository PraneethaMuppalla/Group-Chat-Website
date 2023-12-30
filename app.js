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
const userRoutes = require("./routes/user");

const accessLogStream = fs.createWriteStream(
  path.join(__dirname, "access.log"),
  { flags: "a" }
);

//middleware
const app = express();
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("combined", { stream: accessLogStream }));

//routes
app.use("/user", userRoutes);

sequelise
  .sync()
  .then(() => {
    app.listen(process.env.PORT || 3000, () => {
      console.log(`Sever is listening on port 3000`);
    });
  })
  .catch((err) => {
    console.error(err);
  });
