const Sequelize = require("sequelize");

const Message = require("../models/message");
const User = require("../models/user");
function isStringInValid(string) {
  if (!string || string.length === 0) {
    return true;
  } else {
    return false;
  }
}

exports.postNewMsg = async (req, res, next) => {
  try {
    const { msg } = req.body;
    if (isStringInValid(msg)) {
      return res
        .status(401)
        .json({ success: false, msg: "Bad request. Parameters are missing" });
    }
    const response = await req.user.createMessage({
      message: msg,
    });
    res.status(201).json({ success: true, msg: response });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, msg: err });
  }
};

exports.getAllMsg = async (req, res, next) => {
  try {
    // const response = await req.user.getMessages({
    //   attributes: ["id", "message", "time"],
    // });

    const response = await Message.findAll({
      attributes: [
        "id",
        "message",
        "time",
        [
          Sequelize.literal(
            `(CASE WHEN userId = ${req.user.id} THEN true ELSE false END)`
          ),
          "belongsToUser",
        ],
      ],
      include: [
        {
          model: User,
          attributes: ["name"],
        },
      ],
    });

    res.status(200).json({ success: true, msg: response });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, msg: err });
  }
};
