const express = require("express");
const router = express.Router();

const GroupController = require("../controllers/group");
const authUser = require("../middlewares/auth");

router.post("/create-new-group", authUser, GroupController.createNewGroup);
router.get("/get-user-groups", authUser, GroupController.getGroupsOfUser);
router.post("/add-member-to-group", authUser, GroupController.addMemberToGroup);
router.post(
  "/join-common-group",
  authUser,
  GroupController.addMemberToCommonGroup
);
router.get("/get-all-group-members", authUser, GroupController.getUsersOfGroup);
router.delete(
  "/delete-member-from-group",
  authUser,
  GroupController.removeMemberFromGroup
);
router.post(
  "/get-user-data-from-phone-number",
  authUser,
  GroupController.getUserDataBasedOnPhoneNumber
);
module.exports = router;
