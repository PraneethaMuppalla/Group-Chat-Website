const express = require("express");
const multer = require("multer");

const router = express.Router();
//create a memory storage object
const storage = multer.memoryStorage();
//makes sure that image is always stored in memory and not in disk
const upload = multer({ storage: storage });

const msgController = require("../controllers/message");
const authUser = require("../middleware/auth");

router.post("/new-msg", authUser, msgController.postNewMsg);
router.get("/get-all-msg", authUser, msgController.getAllMsg);
router.post(
  "/upload-img",
  authUser,
  upload.single("image"),
  msgController.uploadNewImg
);

module.exports = router;
