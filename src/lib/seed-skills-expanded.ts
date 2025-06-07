import { prisma } from "./prisma";
import * as fs from "fs";
import * as path from "path";

interface ExpandedCSVRow {
  skillCategory: string;
  skillName: string;
  memberName: string;
  techieCategory: string;
  assignedClient: string;
  expertise: string;
  expertiseRanking: number;
}

// Expertise level mapping based on expanded CSV data
const EXPANDED_EXPERTISE_MAPPING = {
  "Don't know / Heard of it / I have an idea": 1,
  "I know but didn't use it / Just tried it out / Used it once or twice": 2,
  "I know well used it several times": 3,
  "I have wide knowledge I can be reference for others": 4,
} as const;

// Skill categories mapping (expanded)
const EXPANDED_SKILL_CATEGORIES = {
  Tools: "Development Tools",
  Technologies: "Programming Languages & Frameworks",
  Testing: "Testing Tools & Frameworks",
  "Cloud services": "Cloud Platforms & Services",
  Databases: "Database Systems",
  "Servers and runtimes": "Server Technologies & Runtimes",
} as const;

// Knowledge areas mapping (expanded)
const EXPANDED_KNOWLEDGE_AREAS = {
  Tools: "Development Operations",
  Technologies: "Software Development",
  Testing: "Quality Assurance",
  "Cloud services": "Cloud Computing",
  Databases: "Data Management",
  "Servers and runtimes": "Infrastructure",
} as const;

// Techie category to member category mapping
const TECHIE_CATEGORY_MAPPING = {
  "Techie Starter": "Starter",
  "Techie Builder": "Builder", 
  "Techie Solver": "Solver",
  "Techie Wizard": "Wizard",
} as const;

/**
 * Generate email from full name
 * Examples:
 * - "Lucas Emiliano Luna" -> "lucas.emiliano.luna@techietalent.net"
 * - "Juan Pablo Franco Burjel" -> "juan.pablo.franco.burjel@techietalent.net"
 */
function generateEmailFromName(fullName: string): string {
  const emailLocalPart = fullName
    .toLowerCase()
    .replace(/[^a-z\s]/g, '') // Remove non-alphabetic characters except spaces
    .trim()
    .split(/\s+/) // Split by whitespace
    .join('.');
  
  return `${emailLocalPart}@techietalent.net`;
}

/**
 * Parse the CSV content from the expanded data file
 */
function parseExpandedCSV(csvContent: string): ExpandedCSVRow[] {
  const lines = csvContent.split("\n");
  const rows: ExpandedCSVRow[] = [];

  // Skip header line
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    try {
      // Parse the CSV line
      const parsed = parseExpandedCSVLine(line);
      if (parsed) {
        rows.push(parsed);
      }
    } catch (error) {
      console.warn(`⚠️  Could not parse line ${i + 1}: ${line}`);
    }
  }

  return rows;
}

/**
 * Parse a single CSV line with proper comma separation and quoted values
 * Expected format: SkillCategory,SkillName,MemberName,TechieCategory,AssignedClient,Expertise,ExpertiseRanking
 */
function parseExpandedCSVLine(line: string): ExpandedCSVRow | null {
  try {
    // Parse CSV line with proper handling of quoted values
    const values = parseCSVLine(line);
    
    if (values.length < 7) {
      return null;
    }

    const [
      skillCategory,
      skillName,
      memberName,
      techieCategory,
      assignedClient,
      expertise,
      expertiseRankingStr
    ] = values;

    const expertiseRanking = parseInt(expertiseRankingStr.trim());
    if (isNaN(expertiseRanking)) {
      return null;
    }

    return {
      skillCategory: skillCategory.trim(),
      skillName: skillName.trim(),
      memberName: memberName.trim(),
      techieCategory: techieCategory.trim(),
      assignedClient: assignedClient.trim(),
      expertise: expertise.trim(),
      expertiseRanking,
    };
  } catch (error) {
    console.warn(`Error parsing line: ${line}`, error);
    return null;
  }
}

/**
 * Parse a single CSV line handling quoted values and commas
 */
function parseCSVLine(line: string): string[] {
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
    } else if (char === ',' && !inQuotes) {
      // End of field
      values.push(current);
      current = '';
      i++;
    } else {
      current += char;
      i++;
    }
  }

  // Add the last field
  values.push(current);

  return values;
}

/**
 * Get expertise level from description
 */
function getExpandedExpertiseLevel(expertiseDescription: string): number | null {
  const trimmed = expertiseDescription.trim();
  if (!trimmed) return null;

  return EXPANDED_EXPERTISE_MAPPING[trimmed as keyof typeof EXPANDED_EXPERTISE_MAPPING] || null;
}

/**
 * Seed skills data from expanded CSV
 */
export async function seedSkillsExpandedData() {
  console.log("🌱 Starting expanded skills data seeding...");

  // Read expanded CSV file
  const csvPath = path.join(process.cwd(), "skills_expanded_data.csv");
  const csvContent = fs.readFileSync(csvPath, "utf-8");
  const csvRows = parseExpandedCSV(csvContent);

  console.log(`📊 Parsed ${csvRows.length} rows from expanded CSV`);

  if (csvRows.length === 0) {
    console.log("❌ No valid rows found. Please check the CSV format.");
    return;
  }

  // Log first few parsed rows for debugging
  console.log("📋 Sample parsed rows:");
  csvRows.slice(0, 3).forEach((row, index) => {
    console.log(`   ${index + 1}. ${row.skillCategory} | ${row.skillName} | ${row.memberName} | ${row.techieCategory} | ${row.assignedClient} | ${row.expertise} | ${row.expertiseRanking}`);
  });

  // Create a default scale for expertise levels
  const expertiseScale = await prisma.scale.upsert({
    where: { name: "Expertise Level" },
    update: {},
    create: {
      name: "Expertise Level",
      type: "numeric",
      values: "1,2,3,4",
    },
  });

  console.log("✅ Created expertise scale");

  // Create knowledge areas
  const knowledgeAreas = new Map();
  for (const [category, areaName] of Object.entries(EXPANDED_KNOWLEDGE_AREAS)) {
    const area = await prisma.knowledgeArea.upsert({
      where: { name: areaName },
      update: {},
      create: {
        name: areaName,
        description: `Knowledge area for ${category.toLowerCase()}`,
      },
    });
    knowledgeAreas.set(category, area);
  }

  console.log("✅ Created knowledge areas");

  // Create skill categories
  const skillCategories = new Map();
  for (const [category, categoryName] of Object.entries(EXPANDED_SKILL_CATEGORIES)) {
    const skillCategory = await prisma.skillCategory.upsert({
      where: { name: categoryName },
      update: {},
      create: {
        name: categoryName,
        groupingCriteria: `Skills related to ${category.toLowerCase()}`,
      },
    });
    skillCategories.set(category, skillCategory);
  }

  console.log("✅ Created skill categories");

  // Process unique skills
  const uniqueSkills = new Set<string>();
  const skillsByCategory = new Map<string, Set<string>>();

  csvRows.forEach((row) => {
    if (row.skillName) {
      uniqueSkills.add(row.skillName);
      if (!skillsByCategory.has(row.skillCategory)) {
        skillsByCategory.set(row.skillCategory, new Set());
      }
      skillsByCategory.get(row.skillCategory)!.add(row.skillName);
    }
  });

  // Create skills
  const skills = new Map();
  for (const [category, skillNames] of skillsByCategory.entries()) {
    const knowledgeArea = knowledgeAreas.get(category);
    const skillCategory = skillCategories.get(category);

    for (const skillName of skillNames) {
      const skill = await prisma.skill.upsert({
        where: { name: skillName },
        update: {},
        create: {
          name: skillName,
          knowledgeAreaId: knowledgeArea?.id,
          categoryId: skillCategory?.id,
          scaleId: expertiseScale.id,
        },
      });
      skills.set(skillName, skill);
    }
  }

  console.log(`✅ Created ${skills.size} skills`);

  // Process members and their skills
  const uniqueMembers = new Map<string, ExpandedCSVRow>();
  csvRows.forEach((row) => {
    if (row.memberName && !uniqueMembers.has(row.memberName)) {
      uniqueMembers.set(row.memberName, row);
    }
  });

  const members = new Map();

  for (const [memberName, memberData] of uniqueMembers.entries()) {
    const email = generateEmailFromName(memberName);
    const memberCategory = TECHIE_CATEGORY_MAPPING[memberData.techieCategory as keyof typeof TECHIE_CATEGORY_MAPPING] || 'Starter';
    
    const member = await prisma.member.upsert({
      where: { email },
      update: {
        fullName: memberName,
        category: memberCategory,
        currentClient: memberData.assignedClient || null,
      },
      create: {
        email,
        fullName: memberName,
        category: memberCategory,
        currentClient: memberData.assignedClient || null,
        hireDate: new Date(), // Default to current date
      },
    });
    
    console.log(`📝 ${member.id ? 'Updated' : 'Created'} member "${memberName}" (${email})`);
    members.set(memberName, member);
  }

  console.log(`✅ Created ${members.size} members`);

  // Create member-skill relationships
  let memberSkillCount = 0;
  const processedCombinations = new Set<string>();

  for (const row of csvRows) {
    if (!row.skillName || !row.expertise.trim() || !row.memberName) {
      continue; // Skip rows without required data
    }

    const member = members.get(row.memberName);
    const skill = skills.get(row.skillName);
    const expertiseLevel = getExpandedExpertiseLevel(row.expertise) || row.expertiseRanking;

    if (member && skill) {
      const combinationKey = `${member.id}-${skill.id}`;

      // Skip if we've already processed this member-skill combination
      if (processedCombinations.has(combinationKey)) {
        continue;
      }
      processedCombinations.add(combinationKey);

      try {
        await prisma.memberSkill.upsert({
          where: {
            memberId_skillId: {
              memberId: member.id,
              skillId: skill.id,
            },
          },
          update: {
            expertiseLevel,
            expertiseDescription: row.expertise.trim(),
            assessmentDate: new Date(),
          },
          create: {
            memberId: member.id,
            skillId: skill.id,
            expertiseLevel,
            expertiseDescription: row.expertise.trim(),
            assessmentDate: new Date(),
          },
        });
        memberSkillCount++;
      } catch (error) {
        console.warn(
          `⚠️  Failed to create member skill for ${row.memberName} - ${row.skillName}:`,
          error
        );
      }
    }
  }

  console.log(`✅ Created ${memberSkillCount} member-skill relationships`);

  // Summary
  console.log("\n📈 Expanded Seeding Summary:");
  console.log(`   • Knowledge Areas: ${knowledgeAreas.size}`);
  console.log(`   • Skill Categories: ${skillCategories.size}`);
  console.log(`   • Skills: ${skills.size}`);
  console.log(`   • Members: ${members.size}`);
  console.log(`   • Member-Skill Relationships: ${memberSkillCount}`);
  console.log("🎉 Expanded skills data seeding completed successfully!");
}