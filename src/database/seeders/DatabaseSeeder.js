// ./src/database/seeders/DatabaseSeeder.js

import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default class DatabaseSeeder {
  constructor(options = {}) {
    this.options = options;
  }

  async run() {
    const seedersDir = __dirname;

    // Load seeders from the seeders directory excluding DatabaseSeeder and Seeder
    const files = fs.readdirSync(seedersDir).filter((file) => file.endsWith(".js") && file !== "DatabaseSeeder.js" && file !== "Seeder.js");

    // Load each seeder
    for (const file of files) {
      const filePath = path.join(seedersDir, file);
      const fileUrl = pathToFileURL(filePath).href; // Windows-safe

      const module = await import(fileUrl);

      const className = file.replace(".js", "");
      const SeederClass = module.default || module[className];

      if (!SeederClass) {
        console.log(`Seeder not found in file: ${file}`);
        continue;
      }

      const seeder = new SeederClass(this.options);

      console.log(`=> Running: ${file}`);
      await seeder.run();
    }
  }
}
