const express = require("express");
const router = express.Router();

const msgController = require("../controllers/message");
const authUser = require("../middleware/auth");

router.post("/new-msg", authUser, msgController.postNewMsg);

module.exports = router;
