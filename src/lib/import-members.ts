import { prisma } from "./prisma";

interface CSVRow {
  fullName: string;
  email: string;
  hireDate: string;
  currentClient?: string;
  category: string;
  location?: string;
}

interface ImportResult {
  imported: number;
  updated: number;
  skipped: number;
  errors: string[];
  totalErrors: number;
  summary: {
    totalRows: number;
    validRows: number;
    invalidRows: number;
  };
}

// Valid member categories
const VALID_CATEGORIES = ['Starter', 'Builder', 'Solver', 'Wizard'] as const;

/**
 * Infer full name from email handle
 * Examples:
 * - firstName.lastName@techietalent.net -> "FirstName LastName"
 * - john.doe@company.com -> "John Doe"
 * - jane_smith@example.org -> "Jane Smith"
 */
function inferNameFromEmail(email: string): string | null {
  if (!email || !email.includes('@')) {
    return null;
  }

  const [localPart] = email.split('@');
  
  // Handle common separators: dot, underscore, hyphen
  const nameParts = localPart
    .split(/[._-]/)
    .filter(part => part.length > 0)
    .map(part => {
      // Capitalize first letter and make rest lowercase
      return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
    });

  // Only return a name if we have at least 2 parts (first and last name)
  if (nameParts.length >= 2) {
    return nameParts.join(' ');
  }

  // If only one part, capitalize it but it might not be a full name
  if (nameParts.length === 1) {
    return nameParts[0];
  }

  return null;
}

/**
 * Parse CSV content with better handling of different formats
 */
function parseCSV(csvContent: string): { headers: string[]; rows: string[][] } {
  const lines = csvContent.split('\n').map(line => line.trim()).filter(line => line);
  
  if (lines.length < 2) {
    throw new Error('File must contain at least a header and one data row');
  }

  // Detect delimiter (comma, semicolon, or tab)
  const firstLine = lines[0];
  let delimiter = ',';
  if (firstLine.includes(';') && firstLine.split(';').length > firstLine.split(',').length) {
    delimiter = ';';
  } else if (firstLine.includes('\t') && firstLine.split('\t').length > firstLine.split(',').length) {
    delimiter = '\t';
  }

  // Parse headers
  const headers = parseCSVLine(lines[0], delimiter);
  
  // Parse data rows
  const rows: string[][] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    
    try {
      const values = parseCSVLine(line, delimiter);
      rows.push(values);
    } catch (error) {
      console.warn(`Warning: Could not parse line ${i + 1}: ${line}`);
    }
  }

  return { headers, rows };
}

/**
 * Parse a single CSV line handling quoted values
 */
function parseCSVLine(line: string, delimiter: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;
  let i = 0;

  while (i < line.length) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"';
        i += 2;
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
        i++;
      }
    } else if (char === delimiter && !inQuotes) {
      // End of field
      values.push(current.trim());
      current = '';
      i++;
    } else {
      current += char;
      i++;
    }
  }

  // Add the last field
  values.push(current.trim());

  return values;
}

/**
 * Convert CSV row to member data object
 */
function rowToMemberData(headers: string[], values: string[]): Partial<CSVRow> {
  const memberData: any = {};
  
  headers.forEach((header, index) => {
    const normalizedHeader = header.toLowerCase().trim();
    const value = values[index]?.trim() || null;
    
    // Map common header variations to standard field names
    switch (normalizedHeader) {
      case 'fullname':
      case 'full_name':
      case 'name':
      case 'full name':
        memberData.fullName = value;
        break;
      case 'email':
      case 'email_address':
      case 'email address':
        memberData.email = value;
        break;
      case 'hiredate':
      case 'hire_date':
      case 'hire date':
      case 'start_date':
      case 'start date':
        memberData.hireDate = value;
        break;
      case 'currentclient':
      case 'current_client':
      case 'current client':
      case 'client':
        memberData.currentClient = value;
        break;
      case 'category':
      case 'level':
      case 'seniority':
        memberData.category = value;
        break;
      case 'location':
      case 'office':
      case 'city':
        memberData.location = value;
        break;
      default:
        // Keep original header name for unknown fields
        memberData[header] = value;
    }
  });

  return memberData;
}

/**
 * Validate member data
 */
function validateMemberData(memberData: Partial<CSVRow>, rowIndex: number): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Email is required and will be used to infer name if fullName is missing
  if (!memberData.email) {
    errors.push(`Row ${rowIndex}: Missing required field 'email'`);
  } else {
    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(memberData.email)) {
      errors.push(`Row ${rowIndex}: Invalid email format '${memberData.email}'`);
    }
  }

  // fullName is no longer strictly required - we can infer it from email
  // But if provided, it should not be empty
  if (memberData.fullName !== undefined && memberData.fullName !== null && memberData.fullName.trim() === '') {
    errors.push(`Row ${rowIndex}: fullName cannot be empty if provided`);
  }

  if (!memberData.hireDate) {
    errors.push(`Row ${rowIndex}: Missing required field 'hireDate'`);
  } else {
    // Date validation
    const date = new Date(memberData.hireDate);
    if (isNaN(date.getTime())) {
      errors.push(`Row ${rowIndex}: Invalid date format '${memberData.hireDate}'. Use YYYY-MM-DD format`);
    }
  }

  if (!memberData.category) {
    errors.push(`Row ${rowIndex}: Missing required field 'category'`);
  } else {
    // Category validation
    if (!VALID_CATEGORIES.includes(memberData.category as any)) {
      errors.push(`Row ${rowIndex}: Invalid category '${memberData.category}'. Must be one of: ${VALID_CATEGORIES.join(', ')}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Normalize member data
 */
function normalizeMemberData(memberData: Partial<CSVRow>): CSVRow {
  const email = memberData.email?.toLowerCase().trim() || '';
  
  // Use provided fullName or infer from email
  let fullName = memberData.fullName?.trim() || '';
  if (!fullName && email) {
    const inferredName = inferNameFromEmail(email);
    if (inferredName) {
      fullName = inferredName;
      console.log(`📝 Inferred name "${fullName}" from email "${email}"`);
    }
  }

  return {
    fullName,
    email,
    hireDate: memberData.hireDate?.trim() || '',
    currentClient: memberData.currentClient?.trim() || null,
    category: memberData.category?.trim() || '',
    location: memberData.location?.trim() || null,
  };
}

/**
 * Import members from CSV content
 */
export async function importMembersFromCSV(csvContent: string): Promise<ImportResult> {
  console.log("🚀 Starting member import process...");

  const result: ImportResult = {
    imported: 0,
    updated: 0,
    skipped: 0,
    errors: [],
    totalErrors: 0,
    summary: {
      totalRows: 0,
      validRows: 0,
      invalidRows: 0,
    },
  };

  try {
    // Parse CSV
    const { headers, rows } = parseCSV(csvContent);
    result.summary.totalRows = rows.length;

    console.log(`📊 Parsed ${rows.length} rows from CSV with headers: ${headers.join(', ')}`);

    // Process each row
    for (let i = 0; i < rows.length; i++) {
      const rowIndex = i + 2; // +2 because we start from row 1 and skip header
      const values = rows[i];

      try {
        // Convert row to member data
        const rawMemberData = rowToMemberData(headers, values);
        
        // Validate data
        const validation = validateMemberData(rawMemberData, rowIndex);
        
        if (!validation.isValid) {
          result.errors.push(...validation.errors);
          result.skipped++;
          result.summary.invalidRows++;
          continue;
        }

        // Normalize data
        const memberData = normalizeMemberData(rawMemberData);
        result.summary.validRows++;

        // Parse hire date
        const hireDate = new Date(memberData.hireDate);

        // Check if member already exists
        const existingMember = await prisma.member.findUnique({
          where: { email: memberData.email }
        });

        if (existingMember) {
          // Update existing member
          await prisma.member.update({
            where: { email: memberData.email },
            data: {
              fullName: memberData.fullName,
              hireDate: hireDate,
              currentClient: memberData.currentClient,
              category: memberData.category,
              location: memberData.location,
            },
          });
          result.updated++;
          console.log(`✅ Updated member: ${memberData.email}`);
        } else {
          // Create new member
          await prisma.member.create({
            data: {
              email: memberData.email,
              fullName: memberData.fullName,
              hireDate: hireDate,
              currentClient: memberData.currentClient,
              category: memberData.category,
              location: memberData.location,
            },
          });
          result.imported++;
          console.log(`✅ Created member: ${memberData.email}`);
        }

      } catch (error) {
        const errorMessage = `Row ${rowIndex}: Processing error - ${error instanceof Error ? error.message : 'Unknown error'}`;
        console.error(errorMessage, error);
        result.errors.push(errorMessage);
        result.skipped++;
        result.summary.invalidRows++;
      }
    }

    result.totalErrors = result.errors.length;

    // Log summary
    console.log("\n📈 Import Summary:");
    console.log(`   • Total Rows: ${result.summary.totalRows}`);
    console.log(`   • Valid Rows: ${result.summary.validRows}`);
    console.log(`   • Invalid Rows: ${result.summary.invalidRows}`);
    console.log(`   • Imported: ${result.imported}`);
    console.log(`   • Updated: ${result.updated}`);
    console.log(`   • Skipped: ${result.skipped}`);
    console.log(`   • Errors: ${result.totalErrors}`);
    console.log("🎉 Member import completed!");

    return result;

  } catch (error) {
    console.error("❌ Import failed:", error);
    throw new Error(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}