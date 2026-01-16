// src/workers/email.worker.js

import { Worker } from "bullmq";
import { connection } from "../config/queue.js";
import { sendOtpEmailService } from "../utils/otp.util.js";

const emailWorker = new Worker(
  "email-queue",
  async (job) => {
    const { email, otp, purpose } = job.data;

    await sendOtpEmailService({ email, otp, purpose });
  },
  {
    connection,
    concurrency: 5, // send 5 emails in parallel
  }
);

emailWorker.on("completed", (job) => {
  console.log(`Email job ${job.id} completed`);
});

emailWorker.on("failed", (job, err) => {
  console.error(`Email job ${job?.id} failed:`, err.message);
});

export default emailWorker;
