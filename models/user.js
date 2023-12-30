const Sequelize = require("sequelize");
const sequelize = require("../util/database");

const User = sequelize.define("users", {
  id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
  name: Sequelize.STRING,
  email: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
  },
  phoneNum: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false,
  },
});

module.exports = User;
