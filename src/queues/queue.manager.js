// src/queues/queue.manager.js

import { Queue } from "bullmq";
import config from "../config/config.js";
import { redisClient, redisIsHealthy } from "../config/redis.js";
// import { sendOtpEmailService } from "../services/otp.service.js";
import { sendOtpEmailService } from "../utils/otp.util.js";
import { connection } from "../config/queue.js";

class QueueManager {
  constructor() {
    this.emailQueue = null;
  }

  getQueue() {
    console.log("01");
    console.log(config.redis.enabled);
    if (!config.redis.enabled) return null;
    console.log("02");
    if (!redisIsHealthy()) return null;
    console.log("03");

    if (!this.emailQueue) {
      console.log("04");
      //   this.emailQueue = new Queue("email-queue", {
      //     connection: redisClient,
      //   });
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
        return sendOtpEmailService(data); // fallback
      console.log("Direct sendOtpEmailService");
    }

    try {
      console.log("Inside try.");

      await queue.add("send-otp-email", data);
    } catch {
      //   return sendOtpEmailService(data); // fallback on failure
      console.log("Direct sendOtpEmailService");
    }

    return true;
  }
}

export default new QueueManager();
