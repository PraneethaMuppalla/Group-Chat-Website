const Sequelize = require("sequelize");
const sequelize = require("../util/database");
const currentDate = new Date();
const istDateString = currentDate.toLocaleString("en-IN", {
  timeZone: "Asia/Kolkata",
});

const ArchievedMsg = sequelize.define("archieved-msg", {
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
  isImage: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
  },
});

module.exports = ArchievedMsg;
