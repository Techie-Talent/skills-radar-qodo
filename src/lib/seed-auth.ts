import { prisma } from './prisma';
import { DEFAULT_PERMISSIONS, DEFAULT_ROLES } from './permissions';

export async function seedAuthData() {
  console.log('Seeding authentication data...');

  // Create permissions
  for (const permissionData of DEFAULT_PERMISSIONS) {
    await prisma.permission.upsert({
      where: { name: permissionData.name },
      update: {},
      create: permissionData,
    });
  }

  console.log('Permissions seeded');

  // Create roles with permissions
  for (const roleData of DEFAULT_ROLES) {
    const { permissions: permissionNames, ...roleInfo } = roleData;

    const role = await prisma.role.upsert({
      where: { name: roleData.name },
      update: {
        description: roleInfo.description,
        isDefault: roleInfo.isDefault,
      },
      create: roleInfo,
    });

    // Clear existing permissions for this role
    await prisma.rolePermission.deleteMany({
      where: { roleId: role.id },
    });

    // Add permissions to role
    for (const permissionName of permissionNames) {
      const permission = await prisma.permission.findUnique({
        where: { name: permissionName },
      });

      if (permission) {
        await prisma.rolePermission.create({
          data: {
            roleId: role.id,
            permissionId: permission.id,
          },
        });
      }
    }
  }

  console.log('Roles and permissions seeded');
}