const Sequelize = require("sequelize");
const { Op } = require("sequelize");
const MessageSevices = require("../services/message");

const Message = require("../models/message");
const User = require("../models/user");
function isStringInValid(string) {
  if (!string || string.length === 0) {
    return true;
  }
  return false;
}

const postNewMessage = async (req, res, next) => {
  try {
    const { text, groupId } = req.body;
    if (isStringInValid(text) || isStringInValid(groupId)) {
      return res.status(400).json({
        success: false,
        message:
          "Bad request. Please ensure all required parameters are provided.",
      });
    }
    const response = await req.user.createMessage({
      text,
      groupId,
    });
    res
      .status(201)
      .json({ success: true, message: response, name: req.user.name });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err });
  }
};

const uploadNewImage = async (req, res, next) => {
  try {
    const { groupId } = req.body;
    if (isStringInValid(groupId)) {
      return res.status(400).json({
        success: false,
        message:
          "Bad request. Please ensure all required parameters are provided.",
      });
    }
    const fileLocation = await MessageSevices.uploadToS3(req);
    const response = await req.user.createMessage({
      groupId,
      attachmentUrl: fileLocation,
      attachmentType: "image",
    });
    res
      .status(201)
      .json({ success: true, message: response, name: req.user.name });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error occured" });
  }
};

const getAllMessages = async (req, res, next) => {
  try {
    let groupId = +req.query.groupId || null;
    if (!groupId) {
      return res.status(400).json({
        success: false,
        message:
          "Bad request. Please ensure all required parameters are provided.",
      });
    }

    const response = await Message.findAll({
      attributes: [
        ["id", "messageId"],
        "text",
        "attachmentType",
        "attachmentUrl",
        "createdAt",
        [
          Sequelize.literal(
            `(CASE WHEN senderId = ${req.user.id} THEN true ELSE false END)`
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
    });

    res.status(200).json({ success: true, message: response });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err });
  }
};

module.exports = { postNewMessage, uploadNewImage, getAllMessages };
