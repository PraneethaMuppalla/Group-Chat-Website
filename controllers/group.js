const Group = require("../models/group");
const User = require("../models/user");
const GroupMember = require("../models/groupMember");
const sequelize = require("../util/database");

function isStringInValid(string) {
  if (!string || string.length === 0) {
    return true;
  } else {
    return false;
  }
}

exports.createNewGroup = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { groupName } = req.body;
    if (isStringInValid(groupName)) {
      return res
        .status(401)
        .json({ success: false, msg: "Bad request. Parameters are missing" });
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
    res.status(201).json({ success: true, msg: "Group created" });
  } catch (err) {
    await t.rollback();
    console.error(err);
    res.status(500).json({ success: false, msg: err });
  }
};

exports.getGroupsOfUser = async (req, res, next) => {
  try {
    const response = await req.user.getGroups();
    res.status(200).json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, msg: err });
  }
};

exports.getNumData = async (req, res, next) => {
  try {
    const { phoneNum } = req.body;
    if (!phoneNum || phoneNum.length != 10) {
      return res
        .status(400)
        .json({ success: false, msg: "Bad request. Parameters are wrong." });
    }
    if (phoneNum === req.user.phoneNum) {
      return res.status(409).json({ success: false, msg: "It's his number" });
    }
    const users = await User.findAll({
      where: {
        phoneNum,
      },
    });
    const user = users[0];
    if (!user) {
      return res.status(404).json({ success: false, msg: "User not Found" });
    } else {
      return res.status(200).json(user);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, msg: err });
  }
};

exports.addMemToGroup = async (req, res, next) => {
  try {
    const { groupId, userId } = req.body;
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
    console.log(groupDetails);
    if (!groupDetails || groupDetails["users"].length > 0) {
      return res
        .status(409)
        .json({ success: "false", msg: "Conflict occured" });
    } else {
      const userModel = await User.findByPk(userId);
      const response = await groupDetails.addUser(userModel);
      return res.json(response);
    }

    //res.json(groupDetails);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, msg: err });
  }
};

exports.joinMemToCommonGroup = async (req, res, next) => {
  try {
    const groupDetails = await Group.findOne({
      where: { id: 1 },
      attributes: ["id"],
      include: [
        {
          model: User,
          through: {
            where: { userId: req.user.id },
          },
        },
      ],
    });
    if (!groupDetails || groupDetails["users"].length > 0) {
      return res
        .status(409)
        .json({ success: "false", msg: "Conflict occured" });
    } else {
      const response = await groupDetails.addUser(req.user);
      return res.json(response);
    }

    //res.json(groupDetails);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, msg: err });
  }
};

exports.getUsersOfGroup = async (req, res, next) => {
  try {
    const groupId = req.query.groupId;
    if (!groupId) {
      return res
        .status(400)
        .json({ success: false, msg: "Bad request. Parameters are wrong." });
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
    } else {
      return res.status(404).json({ msg: "Group not find" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Some error occured" });
  }
};
