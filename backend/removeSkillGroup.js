const { MongoClient } = require('mongodb');
require('dotenv').config();

async function removeSkillGroup() {
  const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/KalePortfolioDB";
  const client = new MongoClient(mongoUri);
  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db('KalePortfolioDB');

    // Find all skill groups
    const skills = await db.collection('skillsCollection').find({ deleted: { $ne: true } }).toArray();

    console.log('\n=== Current Skill Groups ===');
    skills.forEach((skill, index) => {
      console.log(`${index + 1}. Title: "${skill.title || 'Untitled'}"`);
      console.log(`   Description: "${skill.description || 'No description'}"`);
      console.log(`   ID: ${skill._id}`);
      console.log(`   Number of skills: ${skill.skills?.length || 0}`);
      console.log('');
    });

    // Find the one with 'sdsd' or 'sda dasd' or similar test data
    const targetSkill = skills.find(s =>
      (s.title && (
        s.title.toLowerCase().includes('sda') ||
        s.title.toLowerCase().includes('sdsd') ||
        s.title.toLowerCase().includes('dasd')
      )) ||
      (s.description && (
        s.description.toLowerCase().includes('sda') ||
        s.description.toLowerCase().includes('sdsd') ||
        s.description.toLowerCase().includes('dasd')
      ))
    );

    if (targetSkill) {
      console.log('\n=== Found Target Skill Group to Delete ===');
      console.log(`Title: "${targetSkill.title}"`);
      console.log(`Description: "${targetSkill.description}"`);
      console.log(`ID: ${targetSkill._id}`);
      console.log('\nDeleting...');

      // Permanently delete it
      const result = await db.collection('skillsCollection').deleteOne({ _id: targetSkill._id });

      if (result.deletedCount > 0) {
        console.log('\n✅ Successfully deleted the skill group!');
        console.log(`Deleted count: ${result.deletedCount}`);
      } else {
        console.log('\n❌ Failed to delete. No documents were removed.');
      }
    } else {
      console.log('\n❌ Could not find skill group with "sda" or "dasd" in title or description');
      console.log('Please check the list above and let me know which one to delete.');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
    console.log('\nDatabase connection closed.');
  }
}

removeSkillGroup();