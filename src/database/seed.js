// ./src/database/seed.js

import dotenv from "dotenv";
dotenv.config();

import path from "path";
import mongoose from "mongoose";
import minimist from "minimist";
import connectDB from "../config/db.js";
import { fileURLToPath, pathToFileURL } from "url";

// Fix __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Parse CLI arguments
const argv = minimist(process.argv.slice(2), {
  boolean: ["clean", "force"],
  default: { clean: false, force: false },
});
const className = argv.class || null; // null = run all seeders
const count = argv.count ? parseInt(argv.count) : 10;
const clean = !!argv.clean;
// console.log("ARGV:", argv);

async function runSeeder() {
  try {
    // Prevent seeding in production unless forced
    if (process.env.NODE_ENV !== "development" && !argv.force) {
      console.error("Seeding is disabled! NODE_ENV is not 'development'. Use --force to override.");
      console.error("Current ENV:", process.env.NODE_ENV);
      process.exit(1);
    }

    // Connect to DB if not already connected
    if (mongoose.connection.readyState === 0) {
      console.log("No active DB connection. Connecting...");
      await connectDB();
    } else {
      console.log("DB connection already active. Skipping connectDB().");
    }

    // Decide which seeder to run
    const seederFile = className ? `${className}.js` : "DatabaseSeeder.js";
    const seederPath = path.join(__dirname, "seeders", seederFile); // Path: src/database/seeders/DatabaseSeeder.js
    const SeederModule = await import(pathToFileURL(seederPath).href); // Convert to file:// URL for Windows compatibility
    const SeederClass = SeederModule.default || SeederModule[className];

    if (!SeederClass) throw new Error(`Seeder class not found in: ${seederPath}`);

    // Run the seeder
    console.log(SeederModule, SeederClass);
    const seeder = new SeederClass({ count, clean });
    await seeder.run();

    console.log("Seeding complete!");
    process.exit(0);
  } catch (err) {
    console.error("Seeding error:", err);
    process.exit(1);
  }
}

runSeeder();

// 1. npm run seed [--class=UserSeeder --clean --count=200]
//        │
// 2. seed.js → parse CLI args (className, count, clean)
//        │
// 3. seed.js → connectDB() → MongoDB ready
//        │
// 4a. If className → import that specific seeder
//        │
// 4b. If no className → import DatabaseSeeder
//        │
// 5. Seeder class instantiated → receives count & clean
//        │
// 6. seeder.run() called
//        │
//    ┌─────────────┐
//    │ run() in    │
//    │ Seeder.js   │
//    └─────────────┘
//        │
//    - If clean → deleteMany()
//    - Loop count → call generate() (implemented in child seeder)
//    - insertMany()
//        │
// 7. DatabaseSeeder loops all child seeders → calls run() for each
//        │
// 8. Logging → "Seeded X records for Model"
