const Sequelize = require("sequelize");
const sequelize = require("../utils/database");

const ArchievedMessage = sequelize.define("archieved-message", {
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
    type: Sequelize.ENUM("image", "video"),
  },
  attachmentUrl: {
    type: Sequelize.STRING,
  },
});

module.exports = ArchievedMessage;
