const express = require("express");
const router = express.Router();

const forgotPasswordController = require("../controllers/forgot-password");

router.post("/forgot-passwords", forgotPasswordController.forgotPassword);
router.get(
  "/forgot-passwords/:id/edit",
  forgotPasswordController.resetPassword
);
router.post(
  "/forgot-passwords/:id/update",
  forgotPasswordController.updatePassword
);

module.exports = router;
