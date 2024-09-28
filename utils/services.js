const crypto = require("crypto");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv")

const authorizationMail = async (
  email,
  managerAddress,
  uploadAddress,
  token,
  userName,
  location // this is expected to be an object with latitude and longitude
) => {
  console.log(email, managerAddress, uploadAddress, token, userName, location);
  console.log(location);

  const link = `http://localhost:3000/authorization/${managerAddress}/${uploadAddress}/${token}`;
  
  // Access latitude and longitude from the location object
  const latitude = location.latitude;
  const longitude = location.longitude;

  const locationLink = `https://www.google.com/maps?q=${latitude},${longitude}`;
  
  // Updated subject line to include the location link properly
  const subject = `${userName}  is asking for access. `;
  const text = `Please click the link below to grant access:\n\n${link}\n\n  location:${locationLink}`

  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: "shettysnehal105@gmail.com",
        pass: process.env.mailpass,
      },
    });

    const mailOptions = {
      from: "shettysnehal105@gmail.com",
      to: email,
      subject: subject,
      text: text,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Authorization mail sent successfully");
    return info;
  } catch (error) {
    console.error("Error sending authorization mail:", error);
    throw error;
  }
};
const sendMailForOtp = async (email) => {
  console.log("Attempting to send OTP");

  function generateOTP() {
    let otp = "";
    for (let i = 0; i < 6; i++) {
      const randomDigit = crypto.randomInt(0, 10);
      otp += randomDigit.toString();
    }
    return otp;
  }

  const otp = generateOTP();
  const sender = "shettysnehal105@gmail.com";
  const receiver = email;
  const subject = "Email Verification";
  const text = `OTP: ${otp}`;

  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: "shettysnehal105@gmail.com",
        pass: process.env.mailpass,
      },
    });

    const mailOptions = {
      from: sender,
      to: receiver,
      subject: subject,
      text: text,
    };

    await transporter.sendMail(mailOptions);
    console.log("OTP sent successfully");
    return otp;
  } catch (error) {
    console.error("Error sending OTP:", error);
    throw error;
  }
};

module.exports = {
  sendMailForOtp,
  authorizationMail,
};

// The rest of your code (sendMailForOtp) remains unchanged
