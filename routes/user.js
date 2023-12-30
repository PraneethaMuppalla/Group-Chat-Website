const express = require("express");
const router = express.Router();

const userController = require("../controllers/user");

router.post("/sign-up", userController.signUpUser);
router.post("/login", userController.loginUser);

module.exports = router;
