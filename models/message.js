const Sequelize = require("sequelize");
const sequelize = require("../util/database");
const currentDate = new Date();

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
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW,
    allowNull: false,
  },
});

module.exports = Message;
