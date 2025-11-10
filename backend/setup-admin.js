const bcrypt = require("bcryptjs");
const { MongoClient } = require("mongodb");

// MongoDB connection details
const MONGO_URI = "mongodb://localhost:27017/KalePortfolioDB";
const DB_NAME = "KalePortfolioDB";
const COLLECTION_NAME = "KalePortfolio";

// Admin credentials
const ADMIN_USERNAME = "kale";
const ADMIN_PASSWORD = "KaleAdmin2024!";

async function setupAdmin() {
  const client = new MongoClient(MONGO_URI);

  try {
    await client.connect();
    console.log("✅ Connected to MongoDB");

    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);

    // Check if admin already exists
    const existingAdmin = await collection.findOne({});

    // Hash the credentials
    const hashedUsername = await bcrypt.hash(ADMIN_USERNAME, 10);
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

    const adminData = {
      userName: hashedUsername,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    if (existingAdmin) {
      // Update existing admin
      await collection.updateOne({}, { $set: adminData });
      console.log("✅ Updated existing admin credentials");
    } else {
      // Create new admin
      await collection.insertOne(adminData);
      console.log("✅ Created new admin credentials");
    }

    console.log("\n🎉 Admin setup complete!");
    console.log("📋 Your admin credentials:");
    console.log(`   Username: ${ADMIN_USERNAME}`);
    console.log(`   Password: ${ADMIN_PASSWORD}`);
    console.log("\n⚠️  Please save these credentials securely and change the password after first login!");

  } catch (error) {
    console.error("❌ Error setting up admin:", error);
  } finally {
    await client.close();
    console.log("🔌 Disconnected from MongoDB");
  }
}

// Run the setup
setupAdmin();