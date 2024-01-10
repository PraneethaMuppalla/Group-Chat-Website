const bcrypt = require("bcrypt");
const { Op } = require("sequelize");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

function isStringInValid(string) {
  if (!string || string.length === 0) {
    return true;
  }
  return false;
}

function generateToken(userId) {
  return jwt.sign({ id: userId }, process.env.TOKEN_SECRET);
}

const signUpUser = async (req, res) => {
  try {
    const { name, email, phoneNumber, password } = req.body;
    if (
      isStringInValid(name) ||
      isStringInValid(email) ||
      isStringInValid(phoneNumber) ||
      isStringInValid(password)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Bad request. Please ensure all required parameters are provided.",
      });
    }
    const user = await User.findOne({
      where: {
        [Op.and]: [{ email }, { phoneNumber }],
      },
    });
    if (user) {
      return res
        .status(409)
        .json({ success: false, message: "User already exists. Please login" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const response = await User.create({
      name,
      email,
      password: hashedPassword,
      phoneNumber,
    });
    return res
      .status(201)
      .json({ success: true, message: "User registration successful." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err });
  }
};

const loginUser = async (req, res, next) => {
  try {
    const { phoneNumber, password } = req.body;
    if (isStringInValid(phoneNumber) || isStringInValid(password)) {
      return res.status(400).json({
        success: false,
        message:
          "Bad request. Please ensure all required parameters are provided.",
      });
    }
    const user = await User.findOne({
      where: { phoneNumber },
    });
    if (!user) {
      //user not registered
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      //unauthorized
      return res.status(401).json({
        success: false,
        message: "Phone Number or password is incorrect",
      });
    }
    const token = generateToken(user.id);
    return res.status(200).json({
      success: true,
      message: "Successful Login",
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err });
  }
};

module.exports = { signUpUser, loginUser };
