'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts'
import { Star, TrendingUp, Users, Gift, Award } from 'lucide-react'

interface PointsStats {
  period: {
    id: number
    name: string
    startDate: string
    endDate: string
    pointsPerMember: number
  }
  overview: {
    totalPointsGiven: number
    totalAllocations: number
    totalMembers: number
    membersWhoGavePoints: number
    membersWhoReceivedPoints: number
    participationRate: number
    averagePointsPerAllocation: number
  }
  topReceivers: Array<{
    member: { id: number; fullName: string | null; email: string }
    totalPoints: number
    pointsCount: number
  }>
  topGivers: Array<{
    member: { id: number; fullName: string | null; email: string }
    totalPointsGiven: number
    allocationsCount: number
  }>
  pointsDistribution: Record<string, number>
  dailyActivity: Array<{
    date: string
    points: number
    allocations: number
  }>
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

function getInitials(name: string | null | undefined): string {
  if (!name) return 'U'
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function PointsDashboard() {
  const [stats, setStats] = useState<PointsStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/points/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to fetch statistics')
      }
    } catch (error) {
      console.error('Error fetching points stats:', error)
      setError('Failed to fetch statistics')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <div className="h-4 bg-muted rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error || !stats) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Star className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Points Data Available</h3>
          <p className="text-muted-foreground">
            {error || 'No active points period found. Create a points period to start tracking.'}
          </p>
        </CardContent>
      </Card>
    )
  }

  const distributionData = Object.entries(stats.pointsDistribution).map(([points, count]) => ({
    name: `${points} ${points === '1' ? 'point' : 'points'}`,
    value: count,
    points: parseInt(points)
  }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold mb-2">Points Dashboard</h2>
        <p className="text-muted-foreground">
          Current period: {stats.period.name} 
          <Badge variant="secondary" className="ml-2">
            {stats.period.pointsPerMember} points per member
          </Badge>
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500" />
              Total Points Given
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.overview.totalPointsGiven}</div>
            <p className="text-xs text-muted-foreground">
              {stats.overview.totalAllocations} allocations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Participation Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.overview.participationRate}%</div>
            <p className="text-xs text-muted-foreground">
              {stats.overview.membersWhoGavePoints} of {stats.overview.totalMembers} members
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Gift className="h-4 w-4" />
              Average Points
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.overview.averagePointsPerAllocation}</div>
            <p className="text-xs text-muted-foreground">per allocation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Award className="h-4 w-4" />
              Recipients
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.overview.membersWhoReceivedPoints}</div>
            <p className="text-xs text-muted-foreground">members received points</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Receivers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Top Point Recipients
            </CardTitle>
            <CardDescription>Members who received the most points</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.topReceivers.slice(0, 5).map((receiver, index) => (
                <div key={receiver.member.id} className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                    {index + 1}
                  </div>
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                      {getInitials(receiver.member.fullName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium text-sm">
                      {receiver.member.fullName || receiver.member.email}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {receiver.pointsCount} allocations
                    </p>
                  </div>
                  <Badge variant="secondary">
                    {receiver.totalPoints} points
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Points Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Points Distribution</CardTitle>
            <CardDescription>How points are typically allocated</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={distributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Givers */}
        <Card>
          <CardHeader>
            <CardTitle>Most Active Givers</CardTitle>
            <CardDescription>Members who give points most frequently</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.topGivers.slice(0, 5).map((giver, index) => (
                <div key={giver.member.id} className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-green-500 text-white text-xs font-bold">
                    {index + 1}
                  </div>
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                      {getInitials(giver.member.fullName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium text-sm">
                      {giver.member.fullName || giver.member.email}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {giver.totalPointsGiven} points given
                    </p>
                  </div>
                  <Badge variant="outline">
                    {giver.allocationsCount} allocations
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Daily Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Points Activity</CardTitle>
            <CardDescription>Points given over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={stats.dailyActivity}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => new Date(value).toLocaleDateString()}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleDateString()}
                  formatter={(value, name) => [value, name === 'points' ? 'Points' : 'Allocations']}
                />
                <Line 
                  type="monotone" 
                  dataKey="points" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  name="points"
                />
                <Line 
                  type="monotone" 
                  dataKey="allocations" 
                  stroke="#82ca9d" 
                  strokeWidth={2}
                  name="allocations"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}