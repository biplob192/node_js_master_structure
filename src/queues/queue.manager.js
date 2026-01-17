// src/queues/queue.manager.js

import { Queue } from "bullmq";
import config from "../config/config.js";
import { connection } from "../config/queue.js";
import { redisIsHealthy } from "../config/redis.js";
import { sendOtpEmailService } from "../utils/otp.util.js";

class QueueManager {
  constructor() {
    this.emailQueue = null;
  }

  getQueue() {
    if (!config.redis.enabled) return null;
    if (!redisIsHealthy()) return null;

    if (!this.emailQueue) {
      this.emailQueue = new Queue("email-queue", {
        connection,
        defaultJobOptions: {
          attempts: 3, // retry 3 times
          backoff: {
            type: "exponential",
            delay: 3000, // 3s, 6s, 12s
          },
          removeOnComplete: true,
          removeOnFail: false,
          // removeOnComplete: { age: 3600 * 24 }, // clean after 1 day
          // removeOnFail: { count: 50 }, // keep last 50 failures
        },
      });
    }

    return this.emailQueue;
  }

  async sendOtpEmail(data) {
    const queue = this.getQueue();

    if (!queue) {
      // Send OTP via Direct Email
      return sendOtpEmailService(data); // fallback
    }

    try {
      // Send OTP via Queue
      await queue.add("send-otp-email", data);
    } catch {
      // Send OTP via Direct Email on failure
      return sendOtpEmailService(data); // fallback on failure
    }

    return true;
  }
}

export default new QueueManager();
