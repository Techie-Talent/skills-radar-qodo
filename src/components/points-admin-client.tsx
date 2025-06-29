'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Star, Plus, Calendar, TrendingUp, Lock, Unlock } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface PointPeriod {
  id: number
  name: string
  startDate: string
  endDate: string
  isActive: boolean
  isClosed: boolean
  pointsPerMember: number
  createdAt: string
  _count: {
    points: number
  }
}

interface PointsAdminClientProps {
  periods: PointPeriod[]
}

export function PointsAdminClient({ periods }: PointsAdminClientProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [pointsPerMember, setPointsPerMember] = useState('3')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const activePeriods = periods.filter(p => p.isActive && !p.isClosed)
  const closedPeriods = periods.filter(p => p.isClosed)
  const totalPoints = periods.reduce((sum, period) => sum + period._count.points, 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !startDate || !endDate) {
      setError('Please fill in all required fields')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/points/periods', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          startDate,
          endDate,
          pointsPerMember: parseInt(pointsPerMember),
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Reset form
        setName('')
        setStartDate('')
        setEndDate('')
        setPointsPerMember('3')
        setOpen(false)
        
        // Refresh the page
        router.refresh()
      } else {
        setError(data.error || 'Failed to create period')
      }
    } catch (error) {
      console.error('Error creating period:', error)
      setError('Failed to create period. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const togglePeriodStatus = async (periodId: number, isClosed: boolean) => {
    try {
      const response = await fetch('/api/points/periods', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: periodId,
          isClosed: !isClosed,
        }),
      })

      if (response.ok) {
        router.refresh()
      }
    } catch (error) {
      console.error('Error updating period:', error)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) {
      setName('')
      setStartDate('')
      setEndDate('')
      setPointsPerMember('3')
      setError('')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Points System Management</h1>
          <p className="text-muted-foreground">
            Manage point allocation periods and track recognition activity
          </p>
        </div>
        <Dialog open={open} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Period
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Create New Points Period
                </DialogTitle>
                <DialogDescription>
                  Create a new period for members to allocate recognition points.
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                {error && (
                  <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                    {error}
                  </div>
                )}

                <div className="grid gap-2">
                  <Label htmlFor="name">Period Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., January 2024, Q1 2024"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="startDate">Start Date *</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="endDate">End Date *</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="pointsPerMember">Points per Member</Label>
                  <Input
                    id="pointsPerMember"
                    type="number"
                    min="1"
                    max="10"
                    value={pointsPerMember}
                    onChange={(e) => setPointsPerMember(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Number of points each member can allocate during this period
                  </p>
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating...' : 'Create Period'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Periods</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{periods.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Periods</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activePeriods.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Closed Periods</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{closedPeriods.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Points Given</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalPoints}</div>
          </CardContent>
        </Card>
      </div>

      {/* Periods List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Points Periods
          </CardTitle>
          <CardDescription>
            Manage point allocation periods and their status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {periods.map((period) => (
              <div key={period.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg">{period.name}</h3>
                      <div className="flex gap-2">
                        {period.isActive && !period.isClosed && (
                          <Badge variant="default">Active</Badge>
                        )}
                        {period.isClosed && (
                          <Badge variant="secondary">Closed</Badge>
                        )}
                        {!period.isActive && (
                          <Badge variant="outline">Inactive</Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-6 text-sm text-muted-foreground mb-2">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(period.startDate).toLocaleDateString()} - {new Date(period.endDate).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="h-4 w-4" />
                        {period.pointsPerMember} points per member
                      </span>
                      <span className="flex items-center gap-1">
                        <TrendingUp className="h-4 w-4" />
                        {period._count.points} points allocated
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => togglePeriodStatus(period.id, period.isClosed)}
                      disabled={!period.isActive}
                    >
                      {period.isClosed ? (
                        <>
                          <Unlock className="h-4 w-4 mr-2" />
                          Reopen
                        </>
                      ) : (
                        <>
                          <Lock className="h-4 w-4 mr-2" />
                          Close
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Period Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Period Progress</span>
                    <span>
                      {Math.round(
                        ((new Date().getTime() - new Date(period.startDate).getTime()) /
                          (new Date(period.endDate).getTime() - new Date(period.startDate).getTime())) * 100
                      )}%
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-primary"
                      style={{
                        width: `${Math.min(100, Math.max(0,
                          ((new Date().getTime() - new Date(period.startDate).getTime()) /
                            (new Date(period.endDate).getTime() - new Date(period.startDate).getTime())) * 100
                        ))}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}

            {periods.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Star className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No Points Periods Found</h3>
                <p>Create your first points period to start tracking recognition.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}