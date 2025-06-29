import { prisma } from "./prisma";

/**
 * Determines the appropriate role for a new user based on environment variables
 * @param email - User's email address
 * @returns Promise<Role | null> - The role to assign to the user
 */
export async function determineUserRole(email: string) {
  // Check if user is in admin list
  const adminUsers =
    process.env.ADMIN_USERS?.split(",").map((email) => email.trim()) || [];
  const isAdminUser = adminUsers.includes(email);

  if (isAdminUser) {
    // Assign Admin role to users in admin list
    const adminRole = await prisma.role.findFirst({
      where: { name: "Admin" },
    });

    if (!adminRole) {
      console.warn(`Admin role not found in database for admin user ${email}`);
    }

    return adminRole;
  }

  let roleToAssign = await prisma.role.findFirst({
    where: { isDefault: true },
  });

  // If specified role doesn't exist, fall back to database default
  if (!roleToAssign) {
    roleToAssign = await getDefaultRoleName();

    if (!roleToAssign) {
      console.error(`No default role found in database for user ${email}`);
    }
  }

  return roleToAssign;
}

/**
 * Checks if a user email is in the admin users list
 * @param email - User's email address
 * @returns boolean - True if user is in admin list
 */
export function isAdminUser(email: string): boolean {
  const adminUsers =
    process.env.ADMIN_USERS?.split(",").map((email) => email.trim()) || [];
  return adminUsers.includes(email);
}

/**
 * Gets the default role name from environment variables
 * @returns string - The default role name
 */
export async function getDefaultRoleName() {
  return await prisma.role.findFirst({
    where: { isDefault: true },
  });
}

/**
 * Gets the list of admin users from environment variables
 * @returns string[] - Array of admin user emails
 */
export function getAdminUsers(): string[] {
  return process.env.ADMIN_USERS?.split(",").map((email) => email.trim()) || [];
}
