const factory = require("../ethereum/Factory");
const { authorizationMail } = require("../utils/services");

const Factory = require("../ethereum/Factory");
const upload = require("../ethereum/upload");

const sendMailForAuthorization = async (req, res) => {
  try {
    const { mail, managerAddress, uploadAddress, token ,userName,location} = req.query;
    console.log(mail, managerAddress, uploadAddress, token,userName,location);

    if (!managerAddress || !uploadAddress || !mail || !token||!userName||!location) {
      return res.status(400).json({ error: "Missing..." });
    }

    const Upload = upload(uploadAddress);

    const isDeleted = await Upload.methods.isDeleted().call();

    if (!isDeleted) {
      const emailSent = await authorizationMail(
        mail,
        managerAddress,
        uploadAddress,
        token,
        userName,
        location
      );

      if (emailSent) {
        res.json({ success: true, message: "Email sent successfully" });
      } else {
        res.status(500).json({ error: "Failed to send email" });
      }
    } else {
      res.json({
        success: false,
        message: "This file has been deleted by the user",
      });
    }
  } catch (error) {
    console.error("Error in retrieveNotify:", error);
    res.status(500).json({ error: "An internal server error occurred" });
  }
};

module.exports = { sendMailForAuthorization };
