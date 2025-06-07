import { seedAuthData } from '../src/lib/seed-auth';

async function main() {
  try {
    await seedAuthData();
    console.log('✅ Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

main();