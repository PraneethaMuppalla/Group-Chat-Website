const express = require("express");
const router = express.Router();

const GroupController = require("../controllers/group");
const authUser = require("../middleware/auth");

router.post("/create-new-grp", authUser, GroupController.createNewGroup);
router.get("/get-groups-user", authUser, GroupController.getGroupsOfUser);
router.post("/get-Num-Data", authUser, GroupController.getNumData);
router.post("/post-mem-grp", authUser, GroupController.addMemToGroup);
router.get("/join-common-grp", authUser, GroupController.joinMemToCommonGroup);
router.get("/get-group-members", authUser, GroupController.getUsersOfGroup);
router.delete(
  "/delete-mem-from-grp",
  authUser,
  GroupController.deleteMemOfGroup
);
router.delete("/delete-group", authUser, GroupController.deleteGroup);

module.exports = router;
