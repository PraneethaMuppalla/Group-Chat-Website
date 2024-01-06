const express = require("express");
const router = express.Router();

const forgotPwController = require("../controllers/forgotPw");

router.post("/forgotpassword", forgotPwController.forgotPassword);
router.get("/resetpassword/:uuidId", forgotPwController.resetPassword);
router.post("/updatePassword", forgotPwController.updatePassword);

module.exports = router;
