const Sequelize = require("sequelize");

const sequelise = require("../utils/database");

const forgotPassword = sequelise.define("forgot-password", {
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

module.exports = forgotPassword;
