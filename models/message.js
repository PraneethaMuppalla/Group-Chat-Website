const Sequelize = require("sequelize");
const sequelize = require("../utils/database");

const Message = sequelize.define("message", {
  id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
  text: {
    type: Sequelize.TEXT,
  },
  attachmentType: {
    type: Sequelize.ENUM("IMAGE", "VIDEO"),
  },
  attachmentUrl: {
    type: Sequelize.STRING,
  },
});

module.exports = Message;
