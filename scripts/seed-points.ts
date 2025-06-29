import { PrismaClient } from '../src/generated/prisma'

const prisma = new PrismaClient()

async function seedPoints() {
  console.log('Seeding points system...')

  try {
    // Create current month period
    const currentDate = new Date()
    const currentMonth = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)

    const currentPeriod = await prisma.pointPeriod.upsert({
      where: { name: currentMonth },
      update: {},
      create: {
        name: currentMonth,
        startDate: startOfMonth,
        endDate: endOfMonth,
        isActive: true,
        isClosed: false,
        pointsPerMember: 3
      }
    })

    console.log(`Created current period: ${currentMonth}`)

    // Create previous month period (closed)
    const prevDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    const prevMonth = prevDate.toLocaleString('default', { month: 'long', year: 'numeric' })
    const startOfPrevMonth = new Date(prevDate.getFullYear(), prevDate.getMonth(), 1)
    const endOfPrevMonth = new Date(prevDate.getFullYear(), prevDate.getMonth() + 1, 0)

    const prevPeriod = await prisma.pointPeriod.upsert({
      where: { name: prevMonth },
      update: {},
      create: {
        name: prevMonth,
        startDate: startOfPrevMonth,
        endDate: endOfPrevMonth,
        isActive: false,
        isClosed: true,
        pointsPerMember: 3
      }
    })

    console.log(`Created previous period: ${prevMonth}`)

    // Get some members for sample data
    const members = await prisma.member.findMany({
      take: 10
    })

    if (members.length < 2) {
      console.log('Not enough members to create sample points')
      return
    }

    // Create some sample points for the previous period
    const samplePoints = [
      { giverId: members[0].id, receiverId: members[1].id, amount: 2, message: 'Great work on the project delivery!' },
      { giverId: members[0].id, receiverId: members[2].id, amount: 1, message: 'Thanks for the help with debugging' },
      { giverId: members[1].id, receiverId: members[0].id, amount: 3, message: 'Excellent leadership and guidance' },
      { giverId: members[2].id, receiverId: members[3].id, amount: 1, message: 'Good collaboration on the design' },
      { giverId: members[2].id, receiverId: members[1].id, amount: 2, message: 'Helpful code reviews' },
      { giverId: members[3].id, receiverId: members[0].id, amount: 2, message: 'Great mentoring and support' },
      { giverId: members[3].id, receiverId: members[4].id, amount: 1, message: 'Quick response to issues' },
    ]

    for (const pointData of samplePoints) {
      try {
        await prisma.point.create({
          data: {
            ...pointData,
            periodId: prevPeriod.id
          }
        })
        console.log(`Created point allocation: ${pointData.amount} points from member ${pointData.giverId} to ${pointData.receiverId}`)
      } catch (error) {
        // Skip if already exists or violates constraints
        console.log(`Skipped point allocation (may already exist): ${pointData.giverId} -> ${pointData.receiverId}`)
      }
    }

    // Create a few sample points for current period
    const currentSamplePoints = [
      { giverId: members[4].id, receiverId: members[5].id, amount: 1, message: 'Great teamwork this week!' },
      { giverId: members[5].id, receiverId: members[4].id, amount: 2, message: 'Thanks for the knowledge sharing' },
    ]

    for (const pointData of currentSamplePoints) {
      try {
        await prisma.point.create({
          data: {
            ...pointData,
            periodId: currentPeriod.id
          }
        })
        console.log(`Created current point allocation: ${pointData.amount} points from member ${pointData.giverId} to ${pointData.receiverId}`)
      } catch (error) {
        console.log(`Skipped current point allocation (may already exist): ${pointData.giverId} -> ${pointData.receiverId}`)
      }
    }

    console.log('✅ Points system seeding completed!')
    console.log('\nNext steps:')
    console.log('1. Visit /dashboard and click "Points Dashboard" tab')
    console.log('2. Visit /admin/points to manage periods')
    console.log('3. Try giving points to team members')

  } catch (error) {
    console.error('Error seeding points system:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedPoints()