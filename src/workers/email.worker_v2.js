// src/workers/email.worker.js

import { Worker } from "bullmq";
// import { redisClient, redisIsHealthy } from "../../infra/redis.js";
import { redisClient, redisIsHealthy } from "../config/redis.js";
// import { sendOtpEmailService } from "../services/otp.service.js";
import { sendOtpEmailService } from "../utils/otp.util.js";

let worker = null;

setInterval(() => {
  if (!redisIsHealthy() || worker) return;

  worker = new Worker(
    "email-queue",
    async (job) => {
      await sendOtpEmailService(job.data);
    },
    { connection: redisClient }
  );

  worker.on("error", () => {
    worker = null;
  });
}, 5000);

