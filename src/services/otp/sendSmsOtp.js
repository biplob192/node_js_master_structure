// src/services/otp/sendSmsOtp.js

import twilio from "twilio";
import config from "../../config/config.js";

export const sendSmsOtp = async (phoneNumber, otp, purpose = "Account Verification") => {
  const client = twilio(config.twilio.sid, config.twilio.authToken);

  const message = `Your OTP for ${purpose} is ${otp}. It expires in 10 minutes.`;

  await client.messages.create({
    body: message,
    from: config.twilio.phoneNumber,
    to: phoneNumber,
  });
};
