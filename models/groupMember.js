const Sequelize = require("sequelize");
const sequelize = require("../util/database");
const currentDate = new Date();
const istDateString = currentDate.toLocaleString("en-IN", {
  timeZone: "Asia/Kolkata",
});

const GroupMember = sequelize.define("group-member", {
  id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
  isAdmin: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
});

module.exports = GroupMember;
