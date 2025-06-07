import { prisma } from "./prisma";
import * as fs from "fs";
import * as path from "path";

interface CSVRow {
  date: string;
  email: string;
  skill: string;
  expertiseFullName: string;
}

// Expertise level mapping based on CSV data
const EXPERTISE_MAPPING = {
  "(1) Don't know / Heard of it / I have an idea": 1,
  "(2) I know but didn't use it / Just tried it out / Used it once or twice": 2,
  "(3) I know well, used it several times": 3,
  "(4) I have wide knowledge, I can be reference for others": 4,
} as const;

// Skill categories mapping
const SKILL_CATEGORIES = {
  Technologies: "Programming Languages & Frameworks",
  Tools: "Development Tools",
  Testing: "Testing Tools & Frameworks",
  "Cloud services": "Cloud Platforms & Services",
  Databases: "Database Systems",
  "Servers and runtimes": "Server Technologies & Runtimes",
} as const;

// Knowledge areas mapping
const KNOWLEDGE_AREAS = {
  Technologies: "Software Development",
  Tools: "Development Operations",
  Testing: "Quality Assurance",
  "Cloud services": "Cloud Computing",
  Databases: "Data Management",
  "Servers and runtimes": "Infrastructure",
} as const;

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

function parseCSV(csvContent: string): CSVRow[] {
  const lines = csvContent.split("\n");
  const headers = lines[0].split(";");
  const rows: CSVRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = line.split(",");
    if (values.length >= 4) {
      rows.push({
        date: values[0],
        email: values[1],
        skill: values[2],
        expertiseFullName: values[3],
      });
    }
  }

  return rows;
}

function extractSkillInfo(skillString: string) {
  // Extract category and skill name from strings like "Technologies [.Net - C#]"
  const match = skillString.match(/^([^[]+)\s*\[([^\]]+)\]$/);
  if (match) {
    const category = match[1].trim();
    const skillName = match[2].trim();
    return { category, skillName };
  }

  // Handle cases where it's just a category without brackets
  return { category: skillString.trim(), skillName: null };
}

function getExpertiseLevel(expertiseDescription: string): number | null {
  const trimmed = expertiseDescription.trim();
  if (!trimmed) return null;

  return EXPERTISE_MAPPING[trimmed as keyof typeof EXPERTISE_MAPPING] || null;
}

export async function seedSkillsData() {
  console.log("🌱 Starting skills data seeding...");

  // Read CSV file
  const csvPath = path.join(process.cwd(), "skills.csv");
  const csvContent = fs.readFileSync(csvPath, "utf-8");
  const csvRows = parseCSV(csvContent);

  console.log(`📊 Parsed ${csvRows.length} rows from CSV`);

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
  for (const [category, areaName] of Object.entries(KNOWLEDGE_AREAS)) {
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
  for (const [category, categoryName] of Object.entries(SKILL_CATEGORIES)) {
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
    const { category, skillName } = extractSkillInfo(row.skill);
    if (skillName) {
      uniqueSkills.add(skillName);
      if (!skillsByCategory.has(category)) {
        skillsByCategory.set(category, new Set());
      }
      skillsByCategory.get(category)!.add(skillName);
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
  const memberEmails = new Set(csvRows.map((row) => row.email));
  const members = new Map();

  for (const email of memberEmails) {
    // Infer name from email if not already provided
    const inferredName = inferNameFromEmail(email);
    
    const member = await prisma.member.upsert({
      where: { email },
      update: {
        // Update fullName only if it's currently null and we can infer a name
        fullName: inferredName,
      },
      create: {
        email,
        fullName: inferredName,
      },
    });
    
    if (inferredName) {
      console.log(`📝 ${member.fullName ? 'Updated' : 'Created'} member "${inferredName}" from email "${email}"`);
    }
    
    members.set(email, member);
  }

  console.log(`✅ Created ${members.size} members`);

  // Create member-skill relationships
  let memberSkillCount = 0;
  const processedCombinations = new Set<string>();

  for (const row of csvRows) {
    const { category, skillName } = extractSkillInfo(row.skill);

    if (!skillName || !row.expertiseFullName.trim()) {
      continue; // Skip rows without skill names or expertise levels
    }

    const member = members.get(row.email);
    const skill = skills.get(skillName);
    const expertiseLevel = getExpertiseLevel(row.expertiseFullName);

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
            expertiseDescription: row.expertiseFullName.trim(),
            assessmentDate: new Date(row.date),
          },
          create: {
            memberId: member.id,
            skillId: skill.id,
            expertiseLevel,
            expertiseDescription: row.expertiseFullName.trim(),
            assessmentDate: new Date(row.date),
          },
        });
        memberSkillCount++;
      } catch (error) {
        console.warn(
          `⚠️  Failed to create member skill for ${row.email} - ${skillName}:`,
          error
        );
      }
    }
  }

  console.log(`✅ Created ${memberSkillCount} member-skill relationships`);

  // Summary
  console.log("\n📈 Seeding Summary:");
  console.log(`   • Knowledge Areas: ${knowledgeAreas.size}`);
  console.log(`   • Skill Categories: ${skillCategories.size}`);
  console.log(`   • Skills: ${skills.size}`);
  console.log(`   • Members: ${members.size}`);
  console.log(`   • Member-Skill Relationships: ${memberSkillCount}`);
  console.log("🎉 Skills data seeding completed successfully!");
}
