// src/services/otp/sendEmailOtp.js

import nodemailer from "nodemailer";
import config from "../../config/config.js";

export const sendEmailOtp = async (email, otp, purpose = "Account Verification") => {
  const transporter = nodemailer.createTransport({
    service: config.email.service,
    auth: {
      user: config.email.user,
      pass: config.email.pass,
    },
  });

  const mailOptions = {
    from: config.email.from,
    to: email,
    subject: `${purpose} OTP`,
    html: `
      <p>Your OTP for ${purpose} is:</p>
      <h2>${otp}</h2>
      <p>This code expires in 10 minutes.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};
