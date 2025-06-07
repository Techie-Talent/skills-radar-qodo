import { seedAuthData } from '../src/lib/seed-auth';
import { seedSkillsData } from '../src/lib/seed-skills';
import { seedSkillsExpandedData } from '../src/lib/seed-skills-expanded';

async function main() {
  try {
    console.log('🚀 Starting database seeding...\n');
    
    await seedAuthData();
    console.log('');
    
    // Check if expanded data file exists
    const fs = require('fs');
    const path = require('path');
    const expandedDataPath = path.join(process.cwd(), 'skills_expanded_data.csv');
    
    if (fs.existsSync(expandedDataPath)) {
      console.log('📁 Found expanded skills data file, using expanded seeding...');
      await seedSkillsExpandedData();
    } else {
      console.log('📁 Using original skills data file...');
      await seedSkillsData();
    }
    console.log('');
    
    console.log('✅ Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

main();