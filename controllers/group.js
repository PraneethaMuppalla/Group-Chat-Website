const { Op } = require("sequelize");

const Group = require("../models/group");
const User = require("../models/user");
const GroupMember = require("../models/group-member");
const sequelize = require("../utils/database");

function isStringInValid(string) {
  if (!string || string.length === 0) {
    return true;
  }
  return false;
}

const createNewGroup = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { groupName } = req.body;
    if (isStringInValid(groupName)) {
      return res.status(400).json({
        success: false,
        message:
          "Bad request. Please ensure all required parameters are provided.",
      });
    }
    const group = await Group.create(
      {
        name: groupName,
      },
      { transaction: t }
    );
    const users = await group.addUser(req.user, {
      through: { isAdmin: true },
      transaction: t,
    });
    await t.commit();
    res.status(201).json({ success: true, message: "Group created" });
  } catch (err) {
    await t.rollback();
    console.error(err);
    res.status(500).json({ success: false, message: err });
  }
};

const getGroupsOfUser = async (req, res, next) => {
  try {
    const response = await req.user.getGroups();
    res.status(200).json({ success: true, groups: response });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err });
  }
};

const getUserDataBasedOnPhoneNumber = async (req, res, next) => {
  try {
    const { phoneNumber } = req.body;
    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        message:
          "Bad request. Please ensure all required parameters are provided.",
      });
    }
    if (phoneNumber === req.user.phoneNumber) {
      return res
        .status(409)
        .json({ success: false, message: "It's his number" });
    }
    const user = await User.findOne({
      where: {
        phoneNumber,
      },
    });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not Found" });
    }
    return res.status(200).json({ success: true, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err });
  }
};

const addMemberToGroup = async (req, res, next) => {
  try {
    const { groupId, userId } = req.body;
    if (!groupId || !userId) {
      return res.status(400).json({
        success: false,
        message:
          "Bad request. Please ensure all required parameters are provided.",
      });
    }
    const groupDetails = await Group.findOne({
      where: { id: groupId },
      attributes: ["id"],
      include: [
        {
          model: User,
          through: {
            where: { userId },
          },
        },
      ],
    });
    if (!groupDetails || groupDetails["users"].length > 0) {
      return res
        .status(409)
        .json({ success: "false", message: "Conflict occured" });
    }
    const userModel = await User.findByPk(userId);
    const response = await groupDetails.addUser(userModel);
    return res.status(200).json({ user: userModel, response });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err });
  }
};

const addMemberToCommonGroup = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const groupDetails = await Group.findOne({
      where: { id: 1 },
      attributes: ["id"],
      include: [
        {
          model: User,
          through: {
            where: { userId },
          },
        },
      ],
    });
    if (!groupDetails || groupDetails["users"].length > 0) {
      return res
        .status(409)
        .json({ success: "false", message: "Conflict occured" });
    }
    const response = await groupDetails.addUser(req.user);
    return res.json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err });
  }
};

const getUsersOfGroup = async (req, res, next) => {
  try {
    const groupId = req.query.groupId;
    if (!groupId) {
      return res.status(400).json({
        success: false,
        message:
          "Bad request. Please ensure all required parameters are provided.",
      });
    }
    const response = await Group.findByPk(groupId, {
      attributes: [],
      include: [
        {
          model: User,
          attributes: ["id", "name"],
          through: {
            attributes: ["isAdmin"],
          },
        },
      ],
    });
    if (response) {
      return res.json(response.users);
    }
    return res.status(404).json({ message: "Group not find" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Some error occured" });
  }
};

const removeMemberFromGroup = async (req, res, next) => {
  try {
    const { groupId, userId } = req.query;
    if (!groupId || !userId) {
      return res.status(400).json({
        success: false,
        message:
          "Bad request. Please ensure all required parameters are provided.",
      });
    }
    const response = await GroupMember.destroy({
      where: { [Op.and]: [{ groupId }, { userId }] },
    });
    if (response >= 1) {
      return res.status(200).json({ success: true, message: "Member deleted" });
    }
    return res.status(404).json({ message: "Member not found" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err });
  }
};

module.exports = {
  createNewGroup,
  getGroupsOfUser,
  getUserDataBasedOnPhoneNumber,
  addMemberToGroup,
  addMemberToCommonGroup,
  getUsersOfGroup,
  removeMemberFromGroup,
};
