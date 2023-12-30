const bcrypt = require("bcrypt");
const { Op } = require("sequelize");

const User = require("../models/user");
const { use } = require("../routes/user");

function isStringInValid(string) {
  if (!string || string.length === 0) {
    return true;
  } else {
    return false;
  }
}

exports.signUpUser = async (req, res, next) => {
  try {
    const { name, email, phoneNum, password } = req.body;
    if (
      isStringInValid(name) ||
      isStringInValid(email) ||
      isStringInValid(phoneNum) ||
      isStringInValid(password)
    ) {
      return res
        .status(400)
        .json({ success: false, msg: "Bad request. Parameters are missing" });
    }
    const users = await User.findAll({
      where: {
        [Op.or]: [{ email }, { phoneNum }],
      },
    });
    const user = users[0];
    if (user) {
      return res
        .status(409)
        .json({ success: false, msg: "User already exists. Please login" });
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await User.create({
        name,
        email,
        password: hashedPassword,
        phoneNum,
      });
      return res
        .status(201)
        .json({ success: true, msg: "User registration successful." });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, msg: err });
  }
};
