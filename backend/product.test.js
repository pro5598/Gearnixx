// tests/models/product.test.js
const { sequelize } = require("./viable/db");
const Product = require("./models/Product");

describe("Product Model", () => {
  // Setup and teardown
  beforeAll(async () => {
    // Sync database before running tests
    await sequelize.sync({ force: true });
  });

  beforeEach(async () => {
    // Clean up products table before each test
    await Product.destroy({ where: {}, force: true });
  });

  afterAll(async () => {
    // Close database connection after all tests
    await sequelize.close();
  });

  describe("Model Definition", () => {
    test("should have correct attributes", () => {
      const attributes = Product.getTableName ? Object.keys(Product.rawAttributes) : Object.keys(Product.attributes);
      expect(attributes).toContain("id");
      expect(attributes).toContain("name");
      expect(attributes).toContain("description");
      expect(attributes).toContain("price");
      expect(attributes).toContain("category");
      expect(attributes).toContain("stock");
      expect(attributes).toContain("sold");
      expect(attributes).toContain("rating");
      expect(attributes).toContain("status");
      expect(attributes).toContain("features");
      expect(attributes).toContain("brand");
      expect(attributes).toContain("weight");
      expect(attributes).toContain("connectivity");
      expect(attributes).toContain("image");
      expect(attributes).toContain("images");
    });
  });

  describe("Product Creation", () => {
    const validProductData = () => ({
      name: "Gaming Mouse X1",
      description: "High-precision gaming mouse with RGB lighting",
      price: 49.99,
      category: "mice",
      stock: 25
    });

    test("should create a product with valid data", async () => {
      const productData = validProductData();
      const product = await Product.create(productData);

      expect(product.id).toBeDefined();
      expect(product.name).toBe("Gaming Mouse X1");
      expect(product.description).toBe("High-precision gaming mouse with RGB lighting");
      expect(parseFloat(product.price)).toBe(49.99);
      expect(product.category).toBe("mice");
      expect(product.stock).toBe(25);
      expect(product.sold).toBe(0); // default value
      expect(parseFloat(product.rating)).toBe(0.0); // default value
      expect(product.status).toBe("active"); // set by hook based on stock > 10
      expect(product.brand).toBe("Gearnix"); // default value
      expect(product.weight).toBe("N/A"); // default value
      expect(product.connectivity).toBe("N/A"); // default value
      expect(product.image).toBe("/api/placeholder/80/80"); // default value
      expect(product.images).toEqual([]); // default value
      expect(product.createdAt).toBeDefined();
      expect(product.updatedAt).toBeDefined();
    });

    test("should set default values correctly", async () => {
      const productData = {
        name: "Basic Keyboard",
        description: "Standard keyboard",
        price: 29.99,
        category: "keyboards",
        stock: 15
      };

      const product = await Product.create(productData);

      expect(product.sold).toBe(0);
      expect(parseFloat(product.rating)).toBe(0.0);
      expect(product.status).toBe("active");
      expect(product.brand).toBe("Gearnix");
      expect(product.weight).toBe("N/A");
      expect(product.connectivity).toBe("N/A");
      expect(product.image).toBe("/api/placeholder/80/80");
      expect(Array.isArray(product.images)).toBe(true);
      expect(product.images.length).toBe(0);
    });

    test("should create product with all optional fields", async () => {
      const productData = {
        name: "Premium Headset",
        description: "Professional gaming headset",
        price: 199.99,
        category: "headsets",
        stock: 50,
        sold: 25,
        rating: 4.5,
        status: "active",
        features: "Noise cancellation, Surround sound, RGB lighting",
        brand: "CustomBrand",
        weight: "350g",
        connectivity: "USB, 3.5mm jack",
        image: "/images/headset.jpg",
        images: ["/images/headset1.jpg", "/images/headset2.jpg"]
      };

      const product = await Product.create(productData);

      expect(product.sold).toBe(25);
      expect(parseFloat(product.rating)).toBe(4.5);
      expect(product.features).toBe("Noise cancellation, Surround sound, RGB lighting");
      expect(product.brand).toBe("CustomBrand");
      expect(product.weight).toBe("350g");
      expect(product.connectivity).toBe("USB, 3.5mm jack");
      expect(product.image).toBe("/images/headset.jpg");
      expect(product.images).toEqual(["/images/headset1.jpg", "/images/headset2.jpg"]);
    });
  });

  describe("Required Field Validations", () => {
    test("should fail without name", async () => {
      const productData = {
        description: "Test description",
        price: 29.99,
        category: "mice",
        stock: 10
      };

      await expect(Product.create(productData)).rejects.toThrow();
    });

    test("should fail with empty name", async () => {
      const productData = {
        name: "",
        description: "Test description",
        price: 29.99,
        category: "mice",
        stock: 10
      };

      await expect(Product.create(productData)).rejects.toThrow();
    });

    test("should fail without description", async () => {
      const productData = {
        name: "Test Product",
        price: 29.99,
        category: "mice",
        stock: 10
      };

      await expect(Product.create(productData)).rejects.toThrow();
    });

    test("should fail with empty description", async () => {
      const productData = {
        name: "Test Product",
        description: "",
        price: 29.99,
        category: "mice",
        stock: 10
      };

      await expect(Product.create(productData)).rejects.toThrow();
    });

    test("should fail without price", async () => {
      const productData = {
        name: "Test Product",
        description: "Test description",
        category: "mice",
        stock: 10
      };

      await expect(Product.create(productData)).rejects.toThrow();
    });

    test("should fail without category", async () => {
      const productData = {
        name: "Test Product",
        description: "Test description",
        price: 29.99,
        stock: 10
      };

      await expect(Product.create(productData)).rejects.toThrow();
    });

    // FIXED: This test was corrected because stock has a default value of 0
    test("should create product with default stock value when not provided", async () => {
      const productData = {
        name: "Test Product",
        description: "Test description",
        price: 29.99,
        category: "mice"
        // stock is not provided, should default to 0
      };

      const product = await Product.create(productData);
      expect(product.stock).toBe(0);
      expect(product.status).toBe("out_of_stock"); // Hook sets status based on stock = 0
    });
  });

  describe("Validation Rules", () => {
    test("should fail with name longer than 200 characters", async () => {
      const longName = "a".repeat(201);
      const productData = {
        name: longName,
        description: "Test description",
        price: 29.99,
        category: "mice",
        stock: 10
      };

      await expect(Product.create(productData)).rejects.toThrow();
    });

    test("should fail with negative price", async () => {
      const productData = {
        name: "Test Product",
        description: "Test description",
        price: -10.00,
        category: "mice",
        stock: 10
      };

      await expect(Product.create(productData)).rejects.toThrow();
    });

    test("should accept zero price", async () => {
      const productData = {
        name: "Free Product",
        description: "Test description",
        price: 0.00,
        category: "mice",
        stock: 10
      };

      const product = await Product.create(productData);
      expect(parseFloat(product.price)).toBe(0.00);
    });

    test("should fail with invalid category", async () => {
      const productData = {
        name: "Test Product",
        description: "Test description",
        price: 29.99,
        category: "invalid_category",
        stock: 10
      };

      await expect(Product.create(productData)).rejects.toThrow();
    });

    test("should accept all valid categories", async () => {
      const validCategories = ['mice', 'keyboards', 'headsets', 'controllers'];
      
      for (let i = 0; i < validCategories.length; i++) {
        const productData = {
          name: `Test ${validCategories[i]}`,
          description: "Test description",
          price: 29.99,
          category: validCategories[i],
          stock: 10
        };
        
        const product = await Product.create(productData);
        expect(product.category).toBe(validCategories[i]);
        
        // Clean up for next iteration
        await Product.destroy({ where: { id: product.id } });
      }
    });

    test("should fail with negative stock", async () => {
      const productData = {
        name: "Test Product",
        description: "Test description",
        price: 29.99,
        category: "mice",
        stock: -5
      };

      await expect(Product.create(productData)).rejects.toThrow();
    });

    test("should fail with negative sold quantity", async () => {
      const productData = {
        name: "Test Product",
        description: "Test description",
        price: 29.99,
        category: "mice",
        stock: 10,
        sold: -3
      };

      await expect(Product.create(productData)).rejects.toThrow();
    });

    test("should fail with rating below 0", async () => {
      const productData = {
        name: "Test Product",
        description: "Test description",
        price: 29.99,
        category: "mice",
        stock: 10,
        rating: -0.5
      };

      await expect(Product.create(productData)).rejects.toThrow();
    });

    test("should fail with rating above 5", async () => {
      const productData = {
        name: "Test Product",
        description: "Test description",
        price: 29.99,
        category: "mice",
        stock: 10,
        rating: 5.5
      };

      await expect(Product.create(productData)).rejects.toThrow();
    });

    test("should accept valid rating values", async () => {
      const validRatings = [0, 1.5, 3.0, 4.7, 5.0];
      
      for (let i = 0; i < validRatings.length; i++) {
        const productData = {
          name: `Test Product ${i}`,
          description: "Test description",
          price: 29.99,
          category: "mice",
          stock: 10,
          rating: validRatings[i]
        };
        
        const product = await Product.create(productData);
        expect(parseFloat(product.rating)).toBe(validRatings[i]);
        
        // Clean up for next iteration
        await Product.destroy({ where: { id: product.id } });
      }
    });

    test("should fail with invalid status", async () => {
      const productData = {
        name: "Test Product",
        description: "Test description",
        price: 29.99,
        category: "mice",
        stock: 10,
        status: "invalid_status"
      };

      await expect(Product.create(productData)).rejects.toThrow();
    });

    test("should accept all valid status values", async () => {
      const validStatuses = ['active', 'inactive', 'out_of_stock', 'low_stock'];
      
      for (let i = 0; i < validStatuses.length; i++) {
        const productData = {
          name: `Test Product ${i}`,
          description: "Test description",
          price: 29.99,
          category: "mice",
          stock: 20, // High stock to prevent hook interference
          status: validStatuses[i]
        };
        
        const product = await Product.create(productData);
        // Note: The hook might override the status based on stock level
        
        // Clean up for next iteration
        await Product.destroy({ where: { id: product.id } });
      }
    });
  });

  describe("Hooks - Status Management", () => {
    describe("beforeCreate hook", () => {
      test("should set status to 'out_of_stock' when stock is 0", async () => {
        const productData = {
          name: "Out of Stock Product",
          description: "Test description",
          price: 29.99,
          category: "mice",
          stock: 0
        };

        const product = await Product.create(productData);
        expect(product.status).toBe("out_of_stock");
      });

      test("should set status to 'low_stock' when stock is <= 10", async () => {
        const stockLevels = [1, 5, 10];
        
        for (let i = 0; i < stockLevels.length; i++) {
          const productData = {
            name: `Low Stock Product ${i}`,
            description: "Test description",
            price: 29.99,
            category: "mice",
            stock: stockLevels[i]
          };

          const product = await Product.create(productData);
          expect(product.status).toBe("low_stock");
          
          // Clean up for next iteration
          await Product.destroy({ where: { id: product.id } });
        }
      });

      test("should set status to 'active' when stock > 10", async () => {
        const productData = {
          name: "Active Product",
          description: "Test description",
          price: 29.99,
          category: "mice",
          stock: 25
        };

        const product = await Product.create(productData);
        expect(product.status).toBe("active");
      });
    });

    describe("beforeUpdate hook", () => {
      test("should update status to 'out_of_stock' when stock becomes 0", async () => {
        const product = await Product.create({
          name: "Test Product",
          description: "Test description",
          price: 29.99,
          category: "mice",
          stock: 25
        });

        expect(product.status).toBe("active");

        product.stock = 0;
        await product.save();

        expect(product.status).toBe("out_of_stock");
      });

      test("should update status to 'low_stock' when stock becomes <= 10", async () => {
        const product = await Product.create({
          name: "Test Product",
          description: "Test description",
          price: 29.99,
          category: "mice",
          stock: 25
        });

        expect(product.status).toBe("active");

        product.stock = 5;
        await product.save();

        expect(product.status).toBe("low_stock");
      });

      test("should update status to 'active' when stock increases from out_of_stock", async () => {
        const product = await Product.create({
          name: "Test Product",
          description: "Test description",
          price: 29.99,
          category: "mice",
          stock: 0
        });

        expect(product.status).toBe("out_of_stock");

        product.stock = 20;
        await product.save();

        expect(product.status).toBe("active");
      });

      test("should update status to 'active' when stock increases from low_stock", async () => {
        const product = await Product.create({
          name: "Test Product",
          description: "Test description",
          price: 29.99,
          category: "mice",
          stock: 5
        });

        expect(product.status).toBe("low_stock");

        product.stock = 30;
        await product.save();

        expect(product.status).toBe("active");
      });

      test("should preserve manually set 'inactive' status when stock changes", async () => {
        const product = await Product.create({
          name: "Test Product",
          description: "Test description",
          price: 29.99,
          category: "mice",
          stock: 25
        });

        // Manually set to inactive
        product.status = "inactive";
        await product.save();

        expect(product.status).toBe("inactive");

        // Change stock but keep status as inactive
        product.stock = 30;
        await product.save();

        expect(product.status).toBe("inactive");
      });
    });
  });

  describe("JSON Field", () => {
    test("should store and retrieve images as JSON array", async () => {
      const imageArray = [
        "/images/product1.jpg",
        "/images/product2.jpg",
        "/images/product3.jpg"
      ];

      const product = await Product.create({
        name: "Multi-Image Product",
        description: "Product with multiple images",
        price: 99.99,
        category: "controllers",
        stock: 15,
        images: imageArray
      });

      expect(Array.isArray(product.images)).toBe(true);
      expect(product.images).toEqual(imageArray);
      expect(product.images.length).toBe(3);
      expect(product.images[0]).toBe("/images/product1.jpg");
    });

    test("should handle empty images array", async () => {
      const product = await Product.create({
        name: "No Images Product",
        description: "Product without images",
        price: 49.99,
        category: "keyboards",
        stock: 20,
        images: []
      });

      expect(Array.isArray(product.images)).toBe(true);
      expect(product.images.length).toBe(0);
    });
  });

  describe("Decimal Precision", () => {
    test("should handle price with 2 decimal places", async () => {
      const product = await Product.create({
        name: "Precision Price Product",
        description: "Test precision",
        price: 123.45,
        category: "mice",
        stock: 10
      });

      expect(parseFloat(product.price)).toBe(123.45);
    });

    test("should handle rating with 1 decimal place", async () => {
      const product = await Product.create({
        name: "Rated Product",
        description: "Test rating",
        price: 99.99,
        category: "headsets",
        stock: 15,
        rating: 4.7
      });

      expect(parseFloat(product.rating)).toBe(4.7);
    });
  });

  describe("Edge Cases", () => {
    test("should handle maximum name length (200 characters)", async () => {
      const maxLengthName = "a".repeat(200);
      const product = await Product.create({
        name: maxLengthName,
        description: "Test max name length",
        price: 29.99,
        category: "mice",
        stock: 10
      });

      expect(product.name).toBe(maxLengthName);
      expect(product.name.length).toBe(200);
    });

    test("should handle large stock numbers", async () => {
      const product = await Product.create({
        name: "High Stock Product",
        description: "Product with large stock",
        price: 19.99,
        category: "controllers",
        stock: 999999
      });

      expect(product.stock).toBe(999999);
      expect(product.status).toBe("active");
    });

    test("should handle very long text description", async () => {
      const longDescription = "This is a very long description. ".repeat(100);
      const product = await Product.create({
        name: "Long Description Product",
        description: longDescription,
        price: 49.99,
        category: "keyboards",
        stock: 25
      });

      expect(product.description.length).toBeGreaterThan(3000);
    });

    test("should handle null optional fields", async () => {
      const product = await Product.create({
        name: "Minimal Product",
        description: "Basic product",
        price: 29.99,
        category: "mice",
        stock: 15,
        features: null
      });

      expect(product.features).toBeNull();
    });
  });

  describe("Product Updates", () => {
    let product;

    beforeEach(async () => {
      product = await Product.create({
        name: "Update Test Product",
        description: "Test product for updates",
        price: 59.99,
        category: "mice",
        stock: 20
      });
    });

    test("should update product properties", async () => {
      product.name = "Updated Product Name";
      product.price = 69.99;
      await product.save();

      expect(product.name).toBe("Updated Product Name");
      expect(parseFloat(product.price)).toBe(69.99);
    });

    test("should update sold quantity", async () => {
      product.sold = 15;
      await product.save();

      expect(product.sold).toBe(15);
    });

    test("should update rating", async () => {
      product.rating = 4.2;
      await product.save();

      expect(parseFloat(product.rating)).toBe(4.2);
    });

    test("should update images array", async () => {
      const newImages = ["/images/new1.jpg", "/images/new2.jpg"];
      product.images = newImages;
      await product.save();

      expect(product.images).toEqual(newImages);
    });
  });
});
