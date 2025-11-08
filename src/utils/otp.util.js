// src/utils/otp.util.js

import crypto from "crypto";
import nodemailer from "nodemailer";
import twilio from "twilio";
import Otp from "../models/otp.model.js";
import config from "../config/config.js";

export const generateRandomOtp = () => {
  return crypto.randomInt(100000, 999999).toString();
};

/**
 * Generate a random OTP and store in DB
 */
// export const generateOtp = async (userId, purpose = "verify_email") => {
//   // Before generating new OTP, check if an unexpired OTP exists
//   const existingOtp = await Otp.findOne({ userId, purpose });

//   // Use config.otp.cooldownMs here
//   if (existingOtp && existingOtp.expiresAt > new Date(Date.now() - config.otp.cooldownMs)) {
//     throw new ApiError(429, "Please wait before requesting another OTP");
//   }

//   // Generate a 6-digit OTP with expiry time from config
//   const otp = crypto.randomInt(100000, 999999).toString();
//   const expiresAt = new Date(Date.now() + config.otp.expiryMs);

//   // Store or update existing OTP
//   await Otp.findOneAndUpdate({ userId, purpose }, { otp, expiresAt }, { upsert: true, new: true });

//   return otp;
// };

/**
 * Send OTP via Email (Mailtrap configuration)
 */
export const sendEmailOtp = async (email, otp, purpose = "Account Verification") => {
  // Create Mailtrap transporter
  const transporter = nodemailer.createTransport({
    host: config.mail.host, // sandbox.smtp.mailtrap.io
    port: config.mail.port, // 2525
    auth: {
      user: config.mail.user,
      pass: config.mail.pass,
    },
    logger: true,
    debug: true,
  });

  // Email options
  const mailOptions = {
    from: config.mail.fromEmail,
    to: email,
    subject: `${purpose} - OTP Code`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h3>${purpose}</h3>
        <p>Hello,</p>
        <p>Your One-Time Password (OTP) is:</p>
        <h2 style="color:#007bff; letter-spacing:2px;">${otp}</h2>
        <p>This code will expire in <b>10 minutes</b>.</p>
        <br />
        <p>If you did not request this, please ignore this email.</p>
        <hr />
        <p style="font-size:12px; color:#888;">MyApp © ${new Date().getFullYear()}</p>
      </div>
    `,
  };

  // Send the email
  await transporter.sendMail(mailOptions);

  console.log(`OTP email sent to ${email}`);
  return true;
};

/**
 * Send OTP via SMS
 */
export const sendSmsOtp = async (phoneNumber, otp, purpose = "Account Verification") => {
  const client = twilio(config.twilio.sid, config.twilio.authToken);
  const message = `Your OTP for ${purpose} is ${otp}. It expires in 10 minutes.`;

  await client.messages.create({
    body: message,
    from: config.twilio.phoneNumber,
    to: phoneNumber,
  });

  return true;
};