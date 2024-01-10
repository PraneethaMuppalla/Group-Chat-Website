const express = require("express");
const multer = require("multer");

const router = express.Router();
//create a memory storage object
const storage = multer.memoryStorage();
//makes sure that image is always stored in memory and not in disk
const upload = multer({ storage: storage });

const messageController = require("../controllers/message");
const authUser = require("../middlewares/auth");

router.post("/new-message", authUser, messageController.postNewMessage);
router.get("/get-all-messages", authUser, messageController.getAllMessages);
router.post(
  "/upload-image",
  authUser,
  upload.single("image"),
  messageController.uploadNewImage
);

module.exports = router;
