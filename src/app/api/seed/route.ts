import { NextResponse } from 'next/server';
import { seedAuthData } from '@/lib/seed-auth';

export async function POST() {
  try {
    await seedAuthData();
    return NextResponse.json({ message: 'Database seeded successfully' });
  } catch (error) {
    console.error('Error seeding database:', error);
    return NextResponse.json(
      { error: 'Failed to seed database' },
      { status: 500 }
    );
  }
}