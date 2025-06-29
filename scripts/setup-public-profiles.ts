import { PrismaClient } from '../src/generated/prisma'

const prisma = new PrismaClient()

function generateUsername(email: string): string {
  // Extract the part before @ and clean it up
  const username = email.split('@')[0]
    .toLowerCase()
    .replace(/[^a-z0-9.]/g, '.') // Replace non-alphanumeric chars with dots
    .replace(/\.+/g, '.') // Replace multiple dots with single dot
    .replace(/^\.+|\.+$/g, '') // Remove leading/trailing dots
  
  return username
}

async function setupPublicProfiles() {
  console.log('Setting up public profiles and teams...')

  try {
    // 1. Generate usernames for all members
    console.log('Generating usernames for members...')
    const members = await prisma.member.findMany({
      where: {
        username: null
      }
    })

    for (const member of members) {
      const username = generateUsername(member.email)
      
      // Check if username already exists
      const existingMember = await prisma.member.findUnique({
        where: { username }
      })

      if (!existingMember) {
        await prisma.member.update({
          where: { id: member.id },
          data: { username }
        })
        console.log(`Generated username "${username}" for ${member.email}`)
      } else {
        // Add a number suffix if username exists
        let counter = 1
        let uniqueUsername = `${username}.${counter}`
        
        while (await prisma.member.findUnique({ where: { username: uniqueUsername } })) {
          counter++
          uniqueUsername = `${username}.${counter}`
        }
        
        await prisma.member.update({
          where: { id: member.id },
          data: { username: uniqueUsername }
        })
        console.log(`Generated username "${uniqueUsername}" for ${member.email}`)
      }
    }

    // 2. Create member profiles for members without profiles
    console.log('Creating member profiles...')
    const membersWithoutProfiles = await prisma.member.findMany({
      where: {
        profile: null
      }
    })

    for (const member of membersWithoutProfiles) {
      await prisma.memberProfile.create({
        data: {
          memberId: member.id,
          isPublic: true, // Make profiles public by default
          showSkills: true,
          showAssignments: true,
          showTeamRoles: true,
          showAppreciations: true,
          showFeedback: false, // Keep feedback private by default
          showTalentPool: true,
          bio: `Professional at Techie Talent with expertise in various technologies.`
        }
      })
      console.log(`Created profile for ${member.email}`)
    }

    // 3. Create sample teams with hierarchy
    console.log('Creating sample teams...')
    
    // Create root teams (clients)
    const infobaseTeam = await prisma.team.upsert({
      where: { name: 'Infobase' },
      update: {},
      create: {
        name: 'Infobase',
        description: 'Client team for Infobase projects and initiatives'
      }
    })

    const techieTeam = await prisma.team.upsert({
      where: { name: 'Techie Talent Internal' },
      update: {},
      create: {
        name: 'Techie Talent Internal',
        description: 'Internal Techie Talent team for company operations'
      }
    })

    // Create sub-teams under Infobase
    const infobaseDevTeam = await prisma.team.upsert({
      where: { name: 'Infobase - Development Team' },
      update: {},
      create: {
        name: 'Infobase - Development Team',
        description: 'Development team working on Infobase projects',
        parentTeamId: infobaseTeam.id
      }
    })

    const infobaseDesignTeam = await prisma.team.upsert({
      where: { name: 'Infobase - Design Team' },
      update: {},
      create: {
        name: 'Infobase - Design Team',
        description: 'Design team working on Infobase projects',
        parentTeamId: infobaseTeam.id
      }
    })

    // Create sub-teams under Techie Talent Internal
    const hrTeam = await prisma.team.upsert({
      where: { name: 'Human Resources' },
      update: {},
      create: {
        name: 'Human Resources',
        description: 'HR team managing talent and operations',
        parentTeamId: techieTeam.id
      }
    })

    const marketingTeam = await prisma.team.upsert({
      where: { name: 'Marketing & Sales' },
      update: {},
      create: {
        name: 'Marketing & Sales',
        description: 'Marketing and sales team',
        parentTeamId: techieTeam.id
      }
    })

    // 4. Assign some members to teams
    console.log('Assigning members to teams...')
    const allMembers = await prisma.member.findMany({
      take: 10 // Just assign first 10 members for demo
    })

    // Assign members to different teams
    for (let i = 0; i < allMembers.length; i++) {
      const member = allMembers[i]
      let teamId: number
      let role: string

      // Distribute members across teams
      if (i % 4 === 0) {
        teamId = infobaseDevTeam.id
        role = i === 0 ? 'Team Lead' : 'Developer'
      } else if (i % 4 === 1) {
        teamId = infobaseDesignTeam.id
        role = i === 1 ? 'Design Lead' : 'Designer'
      } else if (i % 4 === 2) {
        teamId = hrTeam.id
        role = i === 2 ? 'HR Manager' : 'HR Specialist'
      } else {
        teamId = marketingTeam.id
        role = i === 3 ? 'Marketing Manager' : 'Marketing Specialist'
      }

      // Check if member is already in this team
      const existingTeamMember = await prisma.teamMember.findUnique({
        where: {
          teamId_memberId: {
            teamId,
            memberId: member.id
          }
        }
      })

      if (!existingTeamMember) {
        await prisma.teamMember.create({
          data: {
            teamId,
            memberId: member.id,
            role
          }
        })
        console.log(`Assigned ${member.email} to team as ${role}`)
      }
    }

    // 5. Create some sample feedback
    console.log('Creating sample feedback...')
    const teamMembers = await prisma.teamMember.findMany({
      include: {
        member: true,
        team: true
      },
      take: 5
    })

    for (const teamMember of teamMembers) {
      // Create member feedback
      await prisma.feedback.create({
        data: {
          content: `Great work on the recent project! ${teamMember.member.fullName || 'This team member'} showed excellent technical skills and collaboration.`,
          rating: Math.floor(Math.random() * 2) + 4, // 4 or 5 stars
          isAnonymous: true,
          receiverId: teamMember.member.id
        }
      })

      // Create team feedback
      await prisma.feedback.create({
        data: {
          content: `The ${teamMember.team.name} has been performing exceptionally well. Great teamwork and delivery quality.`,
          rating: Math.floor(Math.random() * 2) + 4, // 4 or 5 stars
          isAnonymous: true,
          teamId: teamMember.team.id
        }
      })
    }

    console.log('✅ Public profiles and teams setup completed!')
    console.log('\nNext steps:')
    console.log('1. Visit /teams to see the team hierarchy')
    console.log('2. Visit /member/{username} to see public profiles')
    console.log('3. Try leaving feedback on profiles and teams')

  } catch (error) {
    console.error('Error setting up public profiles:', error)
  } finally {
    await prisma.$disconnect()
  }
}

setupPublicProfiles()