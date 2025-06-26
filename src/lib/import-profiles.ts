import { prisma } from "./prisma";

interface CSVProfileRow {
  email: string;
  assignments?: string;
  teamRoles?: string;
  clientAppreciations?: string;
  feedback?: string;
  talentPoolPeriods?: string;
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

/**
 * Parse CSV content with better handling of different formats
 */
function parseCSV(csvContent: string): { headers: string[]; rows: string[][] } {
  const lines = csvContent
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line);

  if (lines.length < 2) {
    throw new Error("File must contain at least a header and one data row");
  }

  // Detect delimiter (comma, semicolon, or tab)
  const firstLine = lines[0];
  let delimiter = ",";
  if (
    firstLine.includes(";") &&
    firstLine.split(";").length > firstLine.split(",").length
  ) {
    delimiter = ";";
  } else if (
    firstLine.includes("\t") &&
    firstLine.split("\t").length > firstLine.split(",").length
  ) {
    delimiter = "\t";
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
      console.log(error);
    }
  }

  return { headers, rows };
}

/**
 * Parse a single CSV line handling quoted values
 */
function parseCSVLine(line: string, delimiter: string): string[] {
  const values: string[] = [];
  let current = "";
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
      current = "";
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
 * Convert CSV row to profile data object
 */
function rowToProfileData(
  headers: string[],
  values: string[]
): Partial<CSVProfileRow> {
  const profileData: Record<string, unknown> = {};

  headers.forEach((header, index) => {
    const normalizedHeader = header.toLowerCase().trim();
    const value = values[index]?.trim() || null;

    // Map common header variations to standard field names
    switch (normalizedHeader) {
      case "email":
      case "email_address":
      case "email address":
        profileData.email = value;
        break;
      case "assignments":
      case "project_assignments":
      case "project assignments":
      case "projects":
        profileData.assignments = value;
        break;
      case "teamroles":
      case "team_roles":
      case "team roles":
      case "roles":
        profileData.teamRoles = value;
        break;
      case "clientappreciations":
      case "client_appreciations":
      case "client appreciations":
      case "appreciations":
      case "client_feedback":
      case "client feedback":
        profileData.clientAppreciations = value;
        break;
      case "feedback":
      case "internal_feedback":
      case "internal feedback":
      case "performance_feedback":
      case "performance feedback":
        profileData.feedback = value;
        break;
      case "talentpoolperiods":
      case "talent_pool_periods":
      case "talent pool periods":
      case "bench_periods":
      case "bench periods":
      case "availability":
        profileData.talentPoolPeriods = value;
        break;
      default:
        // Keep original header name for unknown fields
        profileData[header] = value;
    }
  });

  return profileData;
}

/**
 * Validate profile data
 */
function validateProfileData(
  profileData: Partial<CSVProfileRow>,
  rowIndex: number
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Email is required
  if (!profileData.email) {
    errors.push(`Row ${rowIndex}: Missing required field 'email'`);
  } else {
    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(profileData.email)) {
      errors.push(
        `Row ${rowIndex}: Invalid email format '${profileData.email}'`
      );
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Normalize profile data
 */
function normalizeProfileData(
  profileData: Partial<CSVProfileRow>
): CSVProfileRow {
  return {
    email: profileData.email?.toLowerCase().trim() || "",
    assignments: profileData.assignments?.trim() || undefined,
    teamRoles: profileData.teamRoles?.trim() || undefined,
    clientAppreciations: profileData.clientAppreciations?.trim() || undefined,
    feedback: profileData.feedback?.trim() || undefined,
    talentPoolPeriods: profileData.talentPoolPeriods?.trim() || undefined,
  };
}

/**
 * Import member profiles from CSV content
 */
export async function importProfilesFromCSV(
  csvContent: string
): Promise<ImportResult> {
  console.log("🚀 Starting profile import process...");

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

    console.log(
      `📊 Parsed ${rows.length} rows from CSV with headers: ${headers.join(
        ", "
      )}`
    );

    // Process each row
    for (let i = 0; i < rows.length; i++) {
      const rowIndex = i + 2; // +2 because we start from row 1 and skip header
      const values = rows[i];

      try {
        // Convert row to profile data
        const rawProfileData = rowToProfileData(headers, values);

        // Validate data
        const validation = validateProfileData(rawProfileData, rowIndex);

        if (!validation.isValid) {
          result.errors.push(...validation.errors);
          result.skipped++;
          result.summary.invalidRows++;
          continue;
        }

        // Normalize data
        const profileData = normalizeProfileData(rawProfileData);
        result.summary.validRows++;

        // Check if member exists
        const existingMember = await prisma.member.findUnique({
          where: { email: profileData.email },
          include: { profile: true },
        });

        if (!existingMember) {
          result.errors.push(
            `Row ${rowIndex}: Member with email '${profileData.email}' not found`
          );
          result.skipped++;
          result.summary.invalidRows++;
          continue;
        }

        // Prepare profile data for upsert
        const profileUpdateData = {
          assignments: profileData.assignments || null,
          teamRoles: profileData.teamRoles || null,
          clientAppreciations: profileData.clientAppreciations || null,
          feedback: profileData.feedback || null,
          talentPoolPeriods: profileData.talentPoolPeriods || null,
        };

        // Upsert profile (create if doesn't exist, update if it does)
        await prisma.memberProfile.upsert({
          where: { memberId: existingMember.id },
          create: {
            memberId: existingMember.id,
            ...profileUpdateData,
          },
          update: profileUpdateData,
        });

        if (existingMember.profile) {
          result.updated++;
          console.log(`✅ Updated profile for: ${profileData.email}`);
        } else {
          result.imported++;
          console.log(`✅ Created profile for: ${profileData.email}`);
        }
      } catch (error) {
        const errorMessage = `Row ${rowIndex}: Processing error - ${
          error instanceof Error ? error.message : "Unknown error"
        }`;
        console.error(errorMessage, error);
        result.errors.push(errorMessage);
        result.skipped++;
        result.summary.invalidRows++;
      }
    }

    result.totalErrors = result.errors.length;

    // Log summary
    console.log("\n📈 Profile Import Summary:");
    console.log(`   • Total Rows: ${result.summary.totalRows}`);
    console.log(`   • Valid Rows: ${result.summary.validRows}`);
    console.log(`   • Invalid Rows: ${result.summary.invalidRows}`);
    console.log(`   • Imported: ${result.imported}`);
    console.log(`   • Updated: ${result.updated}`);
    console.log(`   • Skipped: ${result.skipped}`);
    console.log(`   • Errors: ${result.totalErrors}`);
    console.log("🎉 Profile import completed!");

    return result;
  } catch (error) {
    console.error("❌ Profile import failed:", error);
    throw new Error(
      `Profile import failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}
