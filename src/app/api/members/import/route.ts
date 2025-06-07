import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    const text = await file.text();
    const lines = text.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      return NextResponse.json(
        { error: 'File must contain at least a header and one data row' },
        { status: 400 }
      );
    }

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const dataLines = lines.slice(1);

    let imported = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (let i = 0; i < dataLines.length; i++) {
      const line = dataLines[i];
      if (!line.trim()) continue;

      try {
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
        const memberData: any = {};

        headers.forEach((header, index) => {
          memberData[header] = values[index] || null;
        });

        // Validate required fields
        if (!memberData.fullName || !memberData.email || !memberData.hireDate || !memberData.category) {
          errors.push(`Row ${i + 2}: Missing required fields (fullName, email, hireDate, category)`);
          skipped++;
          continue;
        }

        // Validate category
        const validCategories = ['Starter', 'Builder', 'Solver', 'Wizard'];
        if (!validCategories.includes(memberData.category)) {
          errors.push(`Row ${i + 2}: Invalid category "${memberData.category}". Must be one of: ${validCategories.join(', ')}`);
          skipped++;
          continue;
        }

        // Validate date format
        const hireDate = new Date(memberData.hireDate);
        if (isNaN(hireDate.getTime())) {
          errors.push(`Row ${i + 2}: Invalid date format "${memberData.hireDate}". Use YYYY-MM-DD format`);
          skipped++;
          continue;
        }

        // Check if member already exists
        const existingMember = await prisma.member.findUnique({
          where: { email: memberData.email }
        });

        if (existingMember) {
          errors.push(`Row ${i + 2}: Member with email "${memberData.email}" already exists`);
          skipped++;
          continue;
        }

        // Create member
        await prisma.member.create({
          data: {
            email: memberData.email,
            fullName: memberData.fullName,
            hireDate: hireDate,
            currentClient: memberData.currentClient || null,
            category: memberData.category,
            location: memberData.location || null,
          },
        });

        imported++;
      } catch (error) {
        console.error(`Error processing row ${i + 2}:`, error);
        errors.push(`Row ${i + 2}: Processing error`);
        skipped++;
      }
    }

    return NextResponse.json({
      imported,
      skipped,
      errors: errors.slice(0, 10), // Limit to first 10 errors
      totalErrors: errors.length,
    });

  } catch (error) {
    console.error('Error importing members:', error);
    return NextResponse.json(
      { error: 'Failed to import members' },
      { status: 500 }
    );
  }
}