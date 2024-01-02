const express = require("express");
const router = express.Router();

const GroupController = require("../controllers/group");
const authUser = require("../middleware/auth");

router.post("/create-new-grp", authUser, GroupController.createNewGroup);
router.get("/get-groups-user", authUser, GroupController.getGroupsOfUser);
router.post("/get-Num-Data", authUser, GroupController.getNumData);
router.post("/post-mem-grp", authUser, GroupController.addMemToGroup);
router.get("/join-common-grp", authUser, GroupController.joinMemToCommonGroup);
router.get("/get-group-members", GroupController.getUsersOfGroup);

module.exports = router;
