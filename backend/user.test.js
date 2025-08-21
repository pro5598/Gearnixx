// tests/models/user.test.js
const { sequelize } = require("./viable/db");
const User = require("./models/User");
const bcrypt = require("bcryptjs");

describe("User Model", () => {
  // Setup and teardown
  beforeAll(async () => {
    // Sync database before running tests
    await sequelize.sync({ force: true });
  });

  beforeEach(async () => {
    // Clean up users table before each test
    await User.destroy({ where: {}, force: true });
  });

  afterAll(async () => {
    // Close database connection after all tests
    await sequelize.close();
  });

  describe("Model Definition", () => {
    test("should have correct table name", () => {
      expect(User.tableName).toBe("users");
    });

    test("should have correct attributes", () => {
      const attributes = User.getTableName ? Object.keys(User.rawAttributes) : Object.keys(User.attributes);
      expect(attributes).toContain("id");
      expect(attributes).toContain("firstName");
      expect(attributes).toContain("lastName");
      expect(attributes).toContain("username");
      expect(attributes).toContain("email");
      expect(attributes).toContain("password");
      expect(attributes).toContain("gender");
      expect(attributes).toContain("role");
      expect(attributes).toContain("isActive");
      expect(attributes).toContain("lastLogin");
    });
  });

  describe("User Creation", () => {
    test("should create a user with valid data", async () => {
      const userData = {
        firstName: "John",
        lastName: "Doe",
        username: "johndoe123",
        email: "john.doe@example.com",
        password: "password123",
        gender: "male",
      };

      const user = await User.create(userData);

      expect(user.id).toBeDefined();
      expect(user.firstName).toBe("John");
      expect(user.lastName).toBe("Doe");
      expect(user.username).toBe("johndoe123");
      expect(user.email).toBe("john.doe@example.com");
      expect(user.gender).toBe("male");
      expect(user.role).toBe("user"); // default value
      expect(user.isActive).toBe(true); // default value
      expect(user.password).not.toBe("password123"); // should be hashed
      expect(user.createdAt).toBeDefined();
      expect(user.updatedAt).toBeDefined();
    });

    test("should hash password before saving", async () => {
      const userData = {
        firstName: "Jane",
        lastName: "Smith",
        username: "janesmith",
        email: "jane.smith@example.com",
        password: "mypassword",
        gender: "female",
      };

      const user = await User.create(userData);
      
      expect(user.password).not.toBe("mypassword");
      expect(user.password.length).toBeGreaterThan(50); // bcrypt hash length
      expect(await bcrypt.compare("mypassword", user.password)).toBe(true);
    });

    test("should set default role as user", async () => {
      const userData = {
        firstName: "Test",
        lastName: "User",
        username: "testuser",
        email: "test@example.com",
        password: "password123",
        gender: "other",
      };

      const user = await User.create(userData);
      expect(user.role).toBe("user");
    });

    test("should set default isActive as true", async () => {
      const userData = {
        firstName: "Active",
        lastName: "User",
        username: "activeuser",
        email: "active@example.com",
        password: "password123",
        gender: "prefer-not-to-say",
      };

      const user = await User.create(userData);
      expect(user.isActive).toBe(true);
    });
  });

  describe("Validations", () => {
    test("should fail without required fields", async () => {
      await expect(User.create({})).rejects.toThrow();
    });

    test("should fail with invalid email", async () => {
      const userData = {
        firstName: "John",
        lastName: "Doe",
        username: "johndoe",
        email: "invalid-email",
        password: "password123",
        gender: "male",
      };

      await expect(User.create(userData)).rejects.toThrow();
    });

    test("should fail with short firstName", async () => {
      const userData = {
        firstName: "J", // too short
        lastName: "Doe",
        username: "johndoe",
        email: "john@example.com",
        password: "password123",
        gender: "male",
      };

      await expect(User.create(userData)).rejects.toThrow();
    });

    test("should fail with short lastName", async () => {
      const userData = {
        firstName: "John",
        lastName: "D", // too short
        username: "johndoe",
        email: "john@example.com",
        password: "password123",
        gender: "male",
      };

      await expect(User.create(userData)).rejects.toThrow();
    });

    test("should fail with short username", async () => {
      const userData = {
        firstName: "John",
        lastName: "Doe",
        username: "jd", // too short
        email: "john@example.com",
        password: "password123",
        gender: "male",
      };

      await expect(User.create(userData)).rejects.toThrow();
    });

    test("should fail with non-alphanumeric username", async () => {
      const userData = {
        firstName: "John",
        lastName: "Doe",
        username: "john@doe", // contains special character
        email: "john@example.com",
        password: "password123",
        gender: "male",
      };

      await expect(User.create(userData)).rejects.toThrow();
    });

    test("should fail with short password", async () => {
      const userData = {
        firstName: "John",
        lastName: "Doe",
        username: "johndoe",
        email: "john@example.com",
        password: "123", // too short
        gender: "male",
      };

      await expect(User.create(userData)).rejects.toThrow();
    });

    test("should fail with invalid gender", async () => {
      const userData = {
        firstName: "John",
        lastName: "Doe",
        username: "johndoe",
        email: "john@example.com",
        password: "password123",
        gender: "invalid-gender",
      };

      await expect(User.create(userData)).rejects.toThrow();
    });

    test("should fail with invalid role", async () => {
      const userData = {
        firstName: "John",
        lastName: "Doe",
        username: "johndoe",
        email: "john@example.com",
        password: "password123",
        gender: "male",
        role: "invalid-role",
      };

      await expect(User.create(userData)).rejects.toThrow();
    });
  });

  describe("Unique Constraints", () => {
    beforeEach(async () => {
      // Create a user for unique constraint tests
      await User.create({
        firstName: "Existing",
        lastName: "User",
        username: "existinguser",
        email: "existing@example.com",
        password: "password123",
        gender: "male",
      });
    });

    test("should fail with duplicate email", async () => {
      const userData = {
        firstName: "Another",
        lastName: "User",
        username: "anotheruser",
        email: "existing@example.com", // duplicate email
        password: "password123",
        gender: "female",
      };

      await expect(User.create(userData)).rejects.toThrow();
    });

    test("should fail with duplicate username", async () => {
      const userData = {
        firstName: "Another",
        lastName: "User",
        username: "existinguser", // duplicate username
        email: "another@example.com",
        password: "password123",
        gender: "female",
      };

      await expect(User.create(userData)).rejects.toThrow();
    });
  });

  describe("Password Hashing on Update", () => {
    test("should hash password when updated", async () => {
      const user = await User.create({
        firstName: "Update",
        lastName: "Test",
        username: "updatetest",
        email: "update@example.com",
        password: "oldpassword",
        gender: "male",
      });

      const oldHashedPassword = user.password;
      
      user.password = "newpassword";
      await user.save();

      expect(user.password).not.toBe("newpassword");
      expect(user.password).not.toBe(oldHashedPassword);
      expect(await bcrypt.compare("newpassword", user.password)).toBe(true);
    });

    test("should not rehash password if not changed", async () => {
      const user = await User.create({
        firstName: "No",
        lastName: "Rehash",
        username: "norehash",
        email: "norehash@example.com",
        password: "password123",
        gender: "male",
      });

      const originalPassword = user.password;
      
      user.firstName = "Updated";
      await user.save();

      expect(user.password).toBe(originalPassword);
    });
  });

  describe("Instance Methods", () => {
    let user;

    beforeEach(async () => {
      user = await User.create({
        firstName: "Method",
        lastName: "Test",
        username: "methodtest",
        email: "method@example.com",
        password: "testpassword",
        gender: "male",
      });
    });

    describe("comparePassword", () => {
      test("should return true for correct password", async () => {
        const isMatch = await user.comparePassword("testpassword");
        expect(isMatch).toBe(true);
      });

      test("should return false for incorrect password", async () => {
        const isMatch = await user.comparePassword("wrongpassword");
        expect(isMatch).toBe(false);
      });
    });
  });

  describe("Class Methods", () => {
    beforeEach(async () => {
      await User.create({
        firstName: "Find",
        lastName: "Test",
        username: "findtest",
        email: "find@example.com",
        password: "password123",
        gender: "male",
      });
    });

    describe("findByEmail", () => {
      test("should find user by email", async () => {
        const user = await User.findByEmail("find@example.com");
        expect(user).toBeTruthy();
        expect(user.email).toBe("find@example.com");
        expect(user.username).toBe("findtest");
      });

      test("should return null for non-existent email", async () => {
        const user = await User.findByEmail("nonexistent@example.com");
        expect(user).toBeNull();
      });
    });

    describe("findByUsername", () => {
      test("should find user by username", async () => {
        const user = await User.findByUsername("findtest");
        expect(user).toBeTruthy();
        expect(user.username).toBe("findtest");
        expect(user.email).toBe("find@example.com");
      });

      test("should return null for non-existent username", async () => {
        const user = await User.findByUsername("nonexistentuser");
        expect(user).toBeNull();
      });
    });
  });

  describe("Edge Cases", () => {
    test("should handle lastLogin field", async () => {
      const user = await User.create({
        firstName: "Login",
        lastName: "Test",
        username: "logintest",
        email: "login@example.com",
        password: "password123",
        gender: "male",
        lastLogin: new Date(),
      });

      expect(user.lastLogin).toBeInstanceOf(Date);
    });

    test("should allow admin role", async () => {
      const user = await User.create({
        firstName: "Admin",
        lastName: "User",
        username: "adminuser",
        email: "admin@example.com",
        password: "password123",
        gender: "female",
        role: "admin",
      });

      expect(user.role).toBe("admin");
    });

    test("should allow inactive user", async () => {
      const user = await User.create({
        firstName: "Inactive",
        lastName: "User",
        username: "inactiveuser",
        email: "inactive@example.com",
        password: "password123",
        gender: "other",
        isActive: false,
      });

      expect(user.isActive).toBe(false);
    });
  });
});
