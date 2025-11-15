// src/database/seeders/UserSeeder.js

import { faker } from "@faker-js/faker";
import { Seeder } from "./Seeder.js";
import bcrypt from "bcryptjs";
import User from "../../models/user.model.js";

export default class UserSeeder extends Seeder {
  constructor({ count = 10, clean = false } = {}) {
    super({ model: User, count, clean });
  }

  async generate() {
    // Faker official docs
    // https://fakerjs.dev/api/
    
    return {
      name: faker.person.fullName(),
      email: faker.internet.email(),
    //   password: faker.internet.password(),
      password: await bcrypt.hash("P@ssw0rd", 10),
      isVerified: true,
    };
  }
}