const {
    sendMailForAuthorization,
  } = require("../controllers/sendMailForAuthorization");
  const express = require("express");
  const router = express.Router();
  const sendOtp = require("../controllers/sendOtp");
  const detect_pii = require("../dialogflow_mlmodel/detect_pii");
  
  router.route("/sendMailForAuthorization").get(sendMailForAuthorization);
  router.route("/sendOtp").post(sendOtp);
  router.route("/detectpii").post(detect_pii);
  
  module.exports = router;
  