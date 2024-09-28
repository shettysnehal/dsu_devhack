const {sendMailForOtp} = require("../utils/services")



const sendOtp =  async (req, res) => {
  const { email } = req.body;

  console.log('Received data:', email);

  try {
    const otp = await sendMailForOtp(email);
    console.log(otp);
    res.status(200).json({ status: true, message: 'OTP sent successfully', receivedData: email, otp: otp });
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: false, message: 'Failed to send OTP' });
  }
};


module.exports = sendOtp;
