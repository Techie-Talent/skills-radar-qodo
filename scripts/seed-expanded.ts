import { seedAuthData } from '../src/lib/seed-auth';
import { seedSkillsExpandedData } from '../src/lib/seed-skills-expanded';

async function main() {
  try {
    console.log('🚀 Starting expanded skills data seeding...\n');
    
    await seedAuthData();
    console.log('');
    
    await seedSkillsExpandedData();
    console.log('');
    
    console.log('✅ Expanded data seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding expanded data:', error);
    process.exit(1);
  }
}

main();