import { prisma } from '../src/lib/prisma';

async function makeAdmin() {
  try {
    // Get the admin role
    const adminRole = await prisma.role.findUnique({
      where: { name: 'Admin' }
    });

    if (!adminRole) {
      console.error('❌ Admin role not found. Please run the seed script first.');
      return;
    }

    // Get all users to show options
    const users = await prisma.user.findMany({
      include: { role: true }
    });

    console.log('\n📋 Current users:');
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email}) - Role: ${user.role?.name || 'No role'}`);
    });

    // For now, let's make the first user an admin
    // In a real scenario, you'd want to specify the email
    if (users.length > 0) {
      const userToUpdate = users[0]; // First user
      
      await prisma.user.update({
        where: { id: userToUpdate.id },
        data: { roleId: adminRole.id }
      });

      console.log(`\n✅ Successfully made ${userToUpdate.name} (${userToUpdate.email}) an Admin!`);
      console.log('🔄 Please refresh your browser to see the changes.');
    } else {
      console.log('❌ No users found. Please sign in first.');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

makeAdmin();