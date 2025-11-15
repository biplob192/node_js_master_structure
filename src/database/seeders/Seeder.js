// src/database/seeders/Seeder.js

export class Seeder {
  constructor({ model, count = 10, clean = false }) {
    if (!model) throw new Error("Model is required in Seeder constructor");

    this.model = model;
    this.count = count;
    this.clean = clean;
  }

  // Override this in child seeds
  async generate() {
    throw new Error("generate() must be implemented in the child seeder");
  }

  async run() {
    // Clean collection if clean flag is set
    if (this.clean) {
      console.log(`Cleaning collection for ${this.model.modelName}`);
      await this.model.deleteMany({});
    }

    // Generate and insert items
    const items = [];

    for (let i = 0; i < this.count; i++) {
      items.push(await this.generate());
    }

    await this.model.insertMany(items);

    console.log(`Seeded ${this.count} records for ${this.model.modelName}`);
  }
}