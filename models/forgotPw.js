const Sequelize = require("sequelize");

const sequelise = require("../util/database");

const forgotPw = sequelise.define("forgotPw", {
  id: {
    type: Sequelize.STRING,
    allowNull: false,
    primaryKey: true,
  },
  isActive: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
  },
});

module.exports = forgotPw;
