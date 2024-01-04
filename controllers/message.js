const Sequelize = require("sequelize");
const { Op } = require("sequelize");

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
    const { msg, groupId } = req.body;
    if (isStringInValid(msg)) {
      return res
        .status(401)
        .json({ success: false, msg: "Bad request. Parameters are missing" });
    }
    const response = await req.user.createMessage({
      message: msg,
      groupId,
    });
    res.status(201).json({ success: true, msg: response, name: req.user.name });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, msg: err });
  }
};

exports.getAllMsg = async (req, res, next) => {
  try {
    let groupId = +req.query.groupId || null;
    if (!groupId) {
      return res
        .status(400)
        .json({ success: true, msg: "Group Id can't be null" });
    }
    let count = await Message.count({
      where: { groupId },
    });
    let offsetNow = 0;
    if (count > 10) {
      offsetNow = count - 10;
    }
    const response = await Message.findAll({
      attributes: [
        ["id", "messageId"],
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
      where: {
        groupId,
      },
      offset: offsetNow,
      limit: 10,
    });

    res.status(200).json({ success: true, msg: response });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, msg: err });
  }
};
