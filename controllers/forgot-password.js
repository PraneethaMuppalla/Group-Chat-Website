const bcrypt = require("bcrypt");
const Sib = require("sib-api-v3-sdk");
const { v4: uuidv4 } = require("uuid");

const User = require("../models/user");
const ForgotPassword = require("../models/forgot-password");

function isStringInValid(string) {
  if (!string || string.length === 0) {
    return true;
  }
  return false;
}

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (isStringInValid(email)) {
      return res.status(400).json({
        success: false,
        message:
          "Bad request. Please ensure all required parameters are provided.",
      });
    }
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User doesn't exist with this email",
      });
    }
    const uuidId = uuidv4();
    const passWordreq = await ForgotPassword.create({
      id: uuidId,
      isActive: true,
      userId: user.id,
    });
    const client = Sib.ApiClient.instance;
    const apiKey = client.authentications["api-key"];
    apiKey.apiKey = process.env.SIB_KEY;
    const transEmailApi = new Sib.TransactionalEmailsApi();
    const sender = {
      //email used for registering the account
      email: "lakshmimuppalla2453@gmail.com",
      name: "Praneetha",
    };
    const receivers = [
      {
        email: email,
      },
    ];
    const emailResponse = await transEmailApi.sendTransacEmail({
      sender,
      To: receivers,
      subject: "Group Chat Reset Password",
      htmlContent: `<h3>Forgot Password</h3><a href="http://localhost:3000/password/forgot-passwords/${uuidId}/edit">Click here</a>`,
    });
    console.log("respnose ====>>>>>>" + JSON.stringify(emailResponse));
    res.send({});
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err });
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const id = req.params.id;
    const obj = await ForgotPassword.findByPk(id);
    // console.log("object" + obj + "isActive" + obj.isActive);
    if (obj && obj.isActive) {
      return res.send(`<form action="/password/forgot-passwords/${id}/update" method="POST">
      <label>Enter Password</label>
      <br />
      <br />
      <input type="password" name="password"  />
      <br />
      <br />
      <button type="submit" >Ok</button>
      </form>`);
    }
    return res.send(`<h1>This link has expired</h1>`);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err });
  }
};

const updatePassword = async (req, res, next) => {
  try {
    console.log("hit");
    const id = req.params.id;
    const { password } = req.body;
    if (isStringInValid(password) || !id) {
      return res.status(400).json({
        success: false,
        message:
          "Bad request. Please ensure all required parameters are provided.",
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log(hashedPassword);
    const forgotPasswordRow = await ForgotPassword.findByPk(id);
    if (forgotPasswordRow && forgotPasswordRow.isActive) {
      await ForgotPassword.update(
        { isActive: false },
        { where: { userId: forgotPasswordRow.userId } }
      );
      await User.update(
        { password: hashedPassword },
        { where: { id: forgotPasswordRow.userId } }
      );
      return res.json({ success: true });
    }
    return res
      .status(409)
      .json({ success: false, message: "Link already expired" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err });
  }
};
module.exports = { forgotPassword, resetPassword, updatePassword };
