// src/queues/email.queue.js

import { Queue } from "bullmq";
import { connection } from "../config/queue.js";

export const emailQueue = new Queue("email-queue", {
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


export function isQueueAvailable() {
  return connection.status === "ready";
}
