const Sequelize = require("sequelize");
const sequelize = require("../util/database");
const currentDate = new Date();
const istDateString = currentDate.toLocaleString("en-IN", {
  timeZone: "Asia/Kolkata",
});

const Message = sequelize.define("message", {
  id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
  message: {
    type: Sequelize.TEXT,
    allowNull: false,
  },
  time: {
    type: Sequelize.STRING,
    defaultValue: istDateString,
    allowNull: false,
  },
});

module.exports = Message;
